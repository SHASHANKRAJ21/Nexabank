package com.banking.card.dto;

import com.banking.card.model.Card;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardDTO {
    private Long id;
    private String cardNumber;
    private String maskedCardNumber;
    private String customerName;
    private String accountNumber;
    private String email;
    private Card.CardType cardType;
    private Card.CardNetwork network;
    private BigDecimal creditLimit;
    private BigDecimal availableLimit;
    private BigDecimal outstandingAmount;
    private LocalDate expiryDate;
    private Card.CardStatus status;
    private String rewardPoints;
    private LocalDate lastBillingDate;
    private LocalDate nextBillingDate;
    private LocalDateTime createdAt;
}
