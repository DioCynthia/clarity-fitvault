;; FitVault Rewards Contract

;; Define reward token
(define-fungible-token fit-token)

;; Constants
(define-constant reward-per-workout u10)

;; Public functions
(define-public (mint-workout-reward (recipient principal))
  (ft-mint? fit-token reward-per-workout recipient)
)
