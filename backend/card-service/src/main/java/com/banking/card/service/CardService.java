package com.banking.card.service;

import com.banking.card.dto.*;
import com.banking.card.model.Card;
import com.banking.card.model.CardTransaction;
import com.banking.card.repository.CardRepository;
import com.banking.card.repository.CardTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final CardTransactionRepository txRepository;

    public Page<CardDTO> getAllCards(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return cardRepository.findAll(pageable).map(this::toDTO);
    }

    public Page<CardDTO> searchCards(String search, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return cardRepository.searchCards(search, pageable).map(this::toDTO);
    }

    public CardDTO getCardById(Long id) {
        return toDTO(cardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Card not found: " + id)));
    }

    public List<CardDTO> getCardsByAccount(String accountNumber) {
        return cardRepository.findByAccountNumber(accountNumber)
                .stream().map(this::toDTO).toList();
    }

    @Transactional
    public CardDTO blockCard(Long id) {
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        card.setStatus(Card.CardStatus.BLOCKED);
        return toDTO(cardRepository.save(card));
    }

    @Transactional
    public CardDTO unblockCard(Long id) {
        Card card = cardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        card.setStatus(Card.CardStatus.ACTIVE);
        return toDTO(cardRepository.save(card));
    }

    public Page<CardTransaction> getCardTransactions(String cardNumber, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return txRepository.findByCardNumberOrderByCreatedAtDesc(cardNumber, pageable);
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCards", cardRepository.count());
        stats.put("activeCards", cardRepository.countActiveCards());
        stats.put("totalOutstanding", cardRepository.totalOutstanding());
        return stats;
    }

    public Page<CardDTO> getCardsByType(Card.CardType type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return cardRepository.findByCardType(type, pageable).map(this::toDTO);
    }

    private CardDTO toDTO(Card c) {
        return CardDTO.builder()
                .id(c.getId())
                .cardNumber(c.getCardNumber())
                .maskedCardNumber(c.getMaskedCardNumber())
                .customerName(c.getCustomerName())
                .accountNumber(c.getAccountNumber())
                .email(c.getEmail())
                .cardType(c.getCardType())
                .network(c.getNetwork())
                .creditLimit(c.getCreditLimit())
                .availableLimit(c.getAvailableLimit())
                .outstandingAmount(c.getOutstandingAmount())
                .expiryDate(c.getExpiryDate())
                .status(c.getStatus())
                .rewardPoints(c.getRewardPoints())
                .lastBillingDate(c.getLastBillingDate())
                .nextBillingDate(c.getNextBillingDate())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
