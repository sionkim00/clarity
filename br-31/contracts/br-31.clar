;; Constants
(define-constant contract-owner tx-sender)
(define-constant max-limit u31) ;; max limit of a number
;; Errors
(define-constant err-owner-only (err u100))
(define-constant err-out-of-bound (err u101))
(define-constant err-not-a-player (err u102))
(define-constant err-insufficient-players (err u103))
(define-constant err-game-already-started (err u104))
(define-constant err-not-player-turn (err u105))
(define-constant err-game-not-started (err u106))


;; Variables
(define-data-var players (list 2 principal) (list))
(define-data-var counter uint u0)
(define-data-var game-moves uint u0)

(define-public (start (new-players (list 2 principal)))
    (begin 
        (asserts! (is-eq contract-owner tx-sender) err-owner-only)
        (asserts! (is-eq (len (var-get players)) u0) err-game-already-started)
        (asserts! (is-eq (len new-players) u2) err-insufficient-players)
        (var-set players new-players)
        (ok true)
    )
)

(define-public (play (amount uint)) 
    (begin 
        (asserts! (and (>= u3 amount) (<= u1 amount)) err-out-of-bound)
        (asserts! (is-eq (len (var-get players)) u2) err-game-not-started)
        (asserts! (is-some (index-of (var-get players) tx-sender)) err-not-a-player)
        (asserts! (is-eq (element-at (var-get players) u0) (some tx-sender)) err-not-player-turn)
        (if (is-eq (mod (var-get game-moves) u2) u0) 
        )
        (ok true)
    )
)