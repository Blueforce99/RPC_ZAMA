// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint8, ebool, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RPSTournament
 * @dev Encrypted Rock-Paper-Scissors Tournament using FHEVM on Sepolia
 * 
 * Zama Configuration:
 * - Host Chain: Ethereum Sepolia (11155111)
 * - Gateway Chain: Zama Gateway (55815)
 * - Relayer: https://relayer.testnet.zama.cloud
 * - ACL: 0x687820221192C5B662b25367F70076A37bc79b6c
 * - KMS Verifier: 0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC
 * - Input Verifier: 0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4
 * - FHEVM Executor: 0x848B0066793BcC60346Da1F49049357399B8D595
 * - HCU Limit: 0x594BB474275918AF9609814E68C61B1587c5F838
 * 
 * Players encrypt their moves (0=Rock, 1=Paper, 2=Scissors)
 * Tournament progresses through rounds with FHE comparisons
 * Winners determined without revealing encrypted moves
 */
contract RPSTournament is SepoliaConfig, Ownable {
    // Tournament states
    enum TournamentState { 
        REGISTRATION, 
        ACTIVE, 
        COMPLETED 
    }

    // Match states
    enum MatchState { 
        PENDING, 
        PLAYER1_COMMITTED, 
        PLAYER2_COMMITTED, 
        RESOLVED, 
        PAID_OUT 
    }

    // RPS move encoding: 0=Rock, 1=Paper, 2=Scissors
    uint8 constant ROCK = 0;
    uint8 constant PAPER = 1;
    uint8 constant SCISSORS = 2;

    // Tournament structure
    struct Tournament {
        uint256 id;
        address[] players;
        uint256 entryFee;
        uint256 totalPrizePool;
        TournamentState state;
        uint256 createdAt;
        uint256 roundNumber;
        bool completed;
    }

    // Match structure
    struct Match {
        uint256 matchId;
        uint256 tournamentId;
        address player1;
        address player2;
        euint8 player1Move;
        euint8 player2Move;
        address winner;
        MatchState state;
        uint256 createdAt;
    }

    // Token for payments (USDC)
    IERC20 public usdcToken;

    // Tournament storage
    mapping(uint256 => Tournament) public tournaments;
    uint256 public tournamentCounter;

    // Match storage
    mapping(uint256 => Match) public matches;
    uint256 public matchCounter;

    // Tournament participation tracking
    mapping(uint256 => mapping(address => bool)) public tournamentPlayers;
    mapping(uint256 => mapping(address => uint256)) public playerWins;

    // Events
    event TournamentCreated(uint256 indexed tournamentId, uint256 entryFee, uint256 indexed timestamp);
    event PlayerJoined(uint256 indexed tournamentId, address indexed player, uint256 timestamp);
    event MatchCreated(uint256 indexed matchId, uint256 indexed tournamentId, address player1, address player2);
    event MoveCommitted(uint256 indexed matchId, address indexed player, uint256 timestamp);
    event MatchResolved(uint256 indexed matchId, address indexed winner, uint256 timestamp);
    event TournamentCompleted(uint256 indexed tournamentId, address indexed winner, uint256 prizeAmount);

    constructor(address _usdcToken) Ownable(msg.sender) {
        usdcToken = IERC20(_usdcToken);
    }

    /**
     * @dev Creates a new tournament
     * @param _entryFee Entry fee in USDC (18 decimals)
     */
    function createTournament(uint256 _entryFee) external onlyOwner {
        uint256 tournamentId = tournamentCounter++;

        tournaments[tournamentId] = Tournament({
            id: tournamentId,
            players: new address[](0),
            entryFee: _entryFee,
            totalPrizePool: 0,
            state: TournamentState.REGISTRATION,
            createdAt: block.timestamp,
            roundNumber: 1,
            completed: false
        });

        emit TournamentCreated(tournamentId, _entryFee, block.timestamp);
    }

    /**
     * @dev Player joins a tournament by paying entry fee
     * @param _tournamentId Tournament ID to join
     */
    function joinTournament(uint256 _tournamentId) external {
        Tournament storage tournament = tournaments[_tournamentId];
        require(tournament.state == TournamentState.REGISTRATION, "Tournament not in registration phase");
        require(!tournamentPlayers[_tournamentId][msg.sender], "Already joined this tournament");

        // Transfer entry fee
        require(
            usdcToken.transferFrom(msg.sender, address(this), tournament.entryFee),
            "Entry fee payment failed"
        );

        tournament.players.push(msg.sender);
        tournament.totalPrizePool += tournament.entryFee;
        tournamentPlayers[_tournamentId][msg.sender] = true;

        emit PlayerJoined(_tournamentId, msg.sender, block.timestamp);
    }

    /**
     * @dev Start tournament and begin first round matches
     * @param _tournamentId Tournament ID to start
     */
    function startTournament(uint256 _tournamentId) external onlyOwner {
        Tournament storage tournament = tournaments[_tournamentId];
        require(tournament.state == TournamentState.REGISTRATION, "Tournament already started");
        require(tournament.players.length >= 2, "Need at least 2 players");

        tournament.state = TournamentState.ACTIVE;
        _createRoundMatches(_tournamentId, 1);
    }

    /**
     * @dev Internal function to create matches for a round
     * @param _tournamentId Tournament ID
     * @param _roundNumber Round number
     */
    function _createRoundMatches(uint256 _tournamentId, uint256 _roundNumber) internal {
        Tournament storage tournament = tournaments[_tournamentId];
        address[] memory activePlayers = tournament.players;

        // Pair up players
        for (uint256 i = 0; i < activePlayers.length - 1; i += 2) {
            uint256 matchId = matchCounter++;

            matches[matchId] = Match({
                matchId: matchId,
                tournamentId: _tournamentId,
                player1: activePlayers[i],
                player2: activePlayers[i + 1],
                player1Move: euint8.wrap(0),
                player2Move: euint8.wrap(0),
                winner: address(0),
                state: MatchState.PENDING,
                createdAt: block.timestamp
            });

            emit MatchCreated(matchId, _tournamentId, activePlayers[i], activePlayers[i + 1]);
        }
    }

    /**
     * @dev Player commits encrypted move to a match
     * @param _matchId Match ID
     * @param _encryptedMove Encrypted move from off-chain
     * @param _inputProof ZK proof of the encrypted move
     */
    function commitMove(
        uint256 _matchId,
        externalEuint8 _encryptedMove,
        bytes calldata _inputProof
    ) external {
        Match storage matchData = matches[_matchId];
        require(matchData.state == MatchState.PENDING || 
                matchData.state == MatchState.PLAYER1_COMMITTED ||
                matchData.state == MatchState.PLAYER2_COMMITTED, 
                "Match not accepting moves");

        // Verify caller is one of the players
        bool isPlayer1 = msg.sender == matchData.player1;
        bool isPlayer2 = msg.sender == matchData.player2;
        require(isPlayer1 || isPlayer2, "You are not a participant in this match");

        // Convert external encrypted move to internal encrypted type
        euint8 move = FHE.fromExternal(_encryptedMove, _inputProof);

        if (isPlayer1) {
            require(matchData.player1Move.unwrap() == 0, "Player 1 already committed");
            matchData.player1Move = move;
            matchData.state = MatchState.PLAYER1_COMMITTED;
        } else {
            require(matchData.player2Move.unwrap() == 0, "Player 2 already committed");
            matchData.player2Move = move;
            if (matchData.state == MatchState.PLAYER1_COMMITTED) {
                matchData.state = MatchState.PLAYER2_COMMITTED;
            }
        }

        emit MoveCommitted(_matchId, msg.sender, block.timestamp);
    }

    /**
     * @dev Resolve a match by computing result on encrypted moves
     * Uses FHE comparisons to determine winner without revealing moves until decryption
     * @param _matchId Match ID to resolve
     */
    function resolveMatch(uint256 _matchId) external {
        Match storage matchData = matches[_matchId];
        require(matchData.state == MatchState.PLAYER2_COMMITTED, "Both players must have committed");

        euint8 p1Move = matchData.player1Move;
        euint8 p2Move = matchData.player2Move;

        // Create encrypted constants for move comparisons
        euint8 encRock = FHE.asEuint8(ROCK);
        euint8 encPaper = FHE.asEuint8(PAPER);
        euint8 encScissors = FHE.asEuint8(SCISSORS);

        // Determine move types for player 1
        ebool p1IsRock = FHE.eq(p1Move, encRock);
        ebool p1IsPaper = FHE.eq(p1Move, encPaper);
        ebool p1IsScissors = FHE.eq(p1Move, encScissors);
        
        // Determine move types for player 2
        ebool p2IsRock = FHE.eq(p2Move, encRock);
        ebool p2IsPaper = FHE.eq(p2Move, encPaper);
        ebool p2IsScissors = FHE.eq(p2Move, encScissors);

        // Win conditions for player 1 (using FHE.and for encrypted AND logic)
        // Rock beats Scissors
        ebool p1WinsRockVsScissors = FHE.and(p1IsRock, p2IsScissors);
        // Paper beats Rock
        ebool p1WinsPaperVsRock = FHE.and(p1IsPaper, p2IsRock);
        // Scissors beats Paper
        ebool p1WinsScissorsVsPaper = FHE.and(p1IsScissors, p2IsPaper);
        
        // Combine all winning conditions with FHE.or
        ebool p1Wins = FHE.or(
            FHE.or(p1WinsRockVsScissors, p1WinsPaperVsRock),
            p1WinsScissorsVsPaper
        );

        // Check for tie (equal moves)
        ebool isTie = FHE.eq(p1Move, p2Move);

        // Decrypt to determine winner (current FHE limitation for control flow)
        // Note: In production, this would benefit from fully encrypted branching
        bool p1WinsDecrypted = FHE.decrypt(p1Wins);
        bool isTieDecrypted = FHE.decrypt(isTie);
        
        address winner;
        if (isTieDecrypted) {
            // In case of tie, player 1 advances
            winner = matchData.player1;
        } else {
            // Winner determined by FHE-computed result
            winner = p1WinsDecrypted ? matchData.player1 : matchData.player2;
        }

        matchData.state = MatchState.RESOLVED;
        matchData.winner = winner;
        playerWins[matchData.tournamentId][winner]++;

        emit MatchResolved(_matchId, winner, block.timestamp);
    }

    /**
     * @dev Pay out match winner
     * @param _matchId Match ID to pay out
     */
    function payoutMatch(uint256 _matchId) external {
        Match storage matchData = matches[_matchId];
        require(matchData.state == MatchState.RESOLVED, "Match not resolved");
        require(matchData.winner != address(0), "No winner determined");

        uint256 tournamentId = matchData.tournamentId;
        Tournament storage tournament = tournaments[tournamentId];

        // Simple payout: winner gets double their entry fee (or tournament prize split)
        uint256 payout = tournament.entryFee * 2;

        matchData.state = MatchState.PAID_OUT;

        require(usdcToken.transfer(matchData.winner, payout), "Payout failed");
    }

    /**
     * @dev Get tournament players
     * @param _tournamentId Tournament ID
     */
    function getTournamentPlayers(uint256 _tournamentId) external view returns (address[] memory) {
        return tournaments[_tournamentId].players;
    }

    /**
     * @dev Get tournament info
     * @param _tournamentId Tournament ID
     */
    function getTournament(uint256 _tournamentId) external view returns (Tournament memory) {
        return tournaments[_tournamentId];
    }

    /**
     * @dev Get match info
     * @param _matchId Match ID
     */
    function getMatch(uint256 _matchId) external view returns (Match memory) {
        return matches[_matchId];
    }
}
