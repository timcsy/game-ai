# Feature Specification: Simple Ball-Bouncing Brick Breaker Game

**Feature Branch**: `001-brick-breaker-game`  
**Created**: 2026-02-25  
**Status**: Draft  
**Input**: User description: "我想要寫一個簡單的球反彈設計磚頭遊戲" (I want to create a simple ball-bouncing brick game)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Play a Complete Game Round (Priority: P1)

A player opens the game and plays a round of brick-breaking. They move the paddle left and right to keep the ball in play, bounce the ball into the wall of bricks, and try to clear all bricks before the ball falls below the paddle.

**Why this priority**: This is the core gameplay loop. Without it, the feature has no value. Every other story depends on it.

**Independent Test**: Can be fully tested by launching the game, moving the paddle with keyboard or mouse, bouncing the ball, and observing bricks disappearing on hit. Delivers the complete playable game experience.

**Acceptance Scenarios**:

1. **Given** the game has started, **When** the ball contacts a brick, **Then** the brick is removed and the ball reflects off the brick's surface.
2. **Given** the player moves the paddle under the falling ball, **When** the ball hits the paddle, **Then** the ball bounces upward and continues play.
3. **Given** the ball reaches the left, right, or top wall, **When** contact is detected, **Then** the ball reflects off the wall at the correct angle.
4. **Given** all bricks have been cleared, **When** the last brick is destroyed, **Then** the game displays a win message and stops.
5. **Given** the ball falls below the bottom of the screen, **When** it passes the paddle without being hit, **Then** the player loses a life or the game ends.

---

### User Story 2 - Start and Restart the Game (Priority: P2)

A player lands on the game screen and can start a new game. After the game ends (win or loss), they can restart without refreshing the page.

**Why this priority**: Essential for usability. Players need a clear entry point and the ability to replay. Without this, the game is only playable once per page load.

**Independent Test**: Can be fully tested by clicking Start, verifying the game initialises with bricks and ball, then losing the game and clicking Restart to verify the game resets cleanly.

**Acceptance Scenarios**:

1. **Given** the game has loaded, **When** the player presses the Start button, **Then** the ball begins moving and the game is active.
2. **Given** the game has ended (win or loss), **When** the player presses the Restart button, **Then** all bricks are restored, the ball resets to its starting position, and the score resets to zero.
3. **Given** the game is in progress, **When** the player presses a Reset action, **Then** the game returns to the initial state.

---

### User Story 3 - Track Score During Play (Priority: P3)

A player can see their current score update in real time as they destroy bricks. At game end, the final score is displayed clearly.

**Why this priority**: Scoring adds motivation and replayability. It is not required for the core loop but significantly improves the player experience.

**Independent Test**: Can be fully tested by destroying bricks and confirming the displayed score increases by the correct amount per brick. After a game-over or win, confirming the final score is shown.

**Acceptance Scenarios**:

1. **Given** the game is in progress, **When** a brick is destroyed, **Then** the score increases by the brick's point value and the updated score is visible on screen.
2. **Given** the game has ended, **When** the end screen appears, **Then** the player's final score is clearly displayed.
3. **Given** the player restarts the game, **When** the new round begins, **Then** the score resets to zero.

---

### Edge Cases

- What happens when the ball hits the very corner where two walls meet simultaneously?
- What happens when the ball hits the edge of the paddle instead of the centre — does the reflection angle change?
- What happens when multiple bricks are hit in the same frame (e.g., ball passes through a narrow gap)?
- How does the game behave if the browser window is resized mid-game?
- What happens if the player does not move the paddle at all — does the ball start moving automatically or wait for input?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The game MUST display a rectangular play area containing a grid of bricks at the top, a movable paddle at the bottom, and a ball.
- **FR-002**: The ball MUST move continuously once the game starts, bouncing off the top wall, left wall, right wall, and the paddle.
- **FR-003**: The player MUST be able to move the paddle horizontally using keyboard arrow keys or by moving the mouse/pointer within the play area.
- **FR-004**: The paddle MUST be constrained within the horizontal boundaries of the play area and MUST NOT move outside them.
- **FR-005**: When the ball contacts a brick, the brick MUST be removed from the play area and the ball MUST reflect off the surface.
- **FR-006**: The game MUST track and display the player's current score, increasing it each time a brick is destroyed.
- **FR-007**: The game MUST end with a loss condition when the ball passes below the bottom edge of the play area.
- **FR-008**: The game MUST end with a win condition when all bricks have been destroyed.
- **FR-009**: The game MUST display a clear end-game message (win or loss) and provide a Restart option.
- **FR-010**: The game MUST allow the player to start a new game from the initial state, resetting the ball position, bricks, and score.
- **FR-011**: The ball's reflection angle off the paddle MUST vary based on where on the paddle the ball makes contact, giving the player directional control.

### Key Entities

- **Ball**: The moving object that interacts with walls, paddle, and bricks. Key attributes: position, velocity (direction and speed).
- **Paddle**: The player-controlled horizontal bar. Key attributes: position, width. Constrained to the horizontal axis.
- **Brick**: A destructible rectangular block in the play area. Key attributes: position, hit state (intact or destroyed), point value.
- **Game State**: The overall state of the session. Key attributes: active bricks, current score, lives remaining (or game-over flag), play status (not started / playing / won / lost).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new player can understand how to play and start a round within 30 seconds of loading the game, without reading any instructions.
- **SC-002**: All bricks in the play area respond to ball contact within the same visual frame — no brick remains visible after being hit.
- **SC-003**: The ball moves smoothly without visible stuttering or freezing during normal gameplay.
- **SC-004**: The score displayed on screen updates correctly and instantly every time a brick is destroyed, with zero incorrect values observed during a complete game round.
- **SC-005**: Players can successfully restart and play a complete new round after a game-over or win without reloading the page.
- **SC-006**: The paddle responds to player input with no perceptible delay, reaching any horizontal position within the play area when directed.

## Assumptions

- The game is a single-player experience with no multiplayer or network features.
- The game is played in a web browser (as this is a game-ai project targeting browser-based games).
- The initial layout consists of a fixed grid of bricks (e.g., 5–8 rows × 8–12 columns); exact dimensions can be adjusted during planning.
- The player has one life per round (losing the ball ends the game). Multiple lives can be considered as a scope extension.
- Bricks all have equal point value in the base version; differentiated scoring (e.g., coloured bricks with different values) is a future enhancement.
- No sound effects or music are required for the initial version; they are out of scope.
- The game does not require saving progress, user accounts, or leaderboards in this version.
- Ball speed is constant throughout a round at the base level; speed increases as a difficulty feature are out of scope for the initial version.
