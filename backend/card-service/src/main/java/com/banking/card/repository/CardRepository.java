package com.banking.card.repository;

import com.banking.card.model.Card;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    Optional<Card> findByCardNumber(String cardNumber);
    List<Card> findByAccountNumber(String accountNumber);
    Page<Card> findByCardType(Card.CardType type, Pageable pageable);
    Page<Card> findByStatus(Card.CardStatus status, Pageable pageable);

    @Query("SELECT c FROM Card c WHERE " +
           "LOWER(c.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "c.maskedCardNumber LIKE CONCAT('%', :search, '%') OR " +
           "c.accountNumber LIKE CONCAT('%', :search, '%')")
    Page<Card> searchCards(@Param("search") String search, Pageable pageable);

    @Query("SELECT COUNT(c) FROM Card c WHERE c.status = 'ACTIVE'")
    long countActiveCards();

    @Query("SELECT SUM(c.outstandingAmount) FROM Card c WHERE c.status = 'ACTIVE'")
    java.math.BigDecimal totalOutstanding();
}
