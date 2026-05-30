package com.banking.card.controller;

import com.banking.card.dto.*;
import com.banking.card.model.Card;
import com.banking.card.model.CardTransaction;
import com.banking.card.service.CardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Cards", description = "Card management APIs")
public class CardController {

    private final CardService cardService;

    @GetMapping
    @Operation(summary = "Get all cards")
    public ResponseEntity<ApiResponse<Page<CardDTO>>> getAllCards(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(cardService.getAllCards(page, size), "Cards retrieved"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<CardDTO>>> searchCards(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(cardService.searchCards(query, page, size), "Search results"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CardDTO>> getCardById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(cardService.getCardById(id), "Card retrieved"));
    }

    @GetMapping("/account/{accountNumber}")
    public ResponseEntity<ApiResponse<List<CardDTO>>> getCardsByAccount(@PathVariable String accountNumber) {
        return ResponseEntity.ok(ApiResponse.success(cardService.getCardsByAccount(accountNumber), "Cards retrieved"));
    }

    @PostMapping("/{id}/block")
    public ResponseEntity<ApiResponse<CardDTO>> blockCard(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(cardService.blockCard(id), "Card blocked successfully"));
    }

    @PostMapping("/{id}/unblock")
    public ResponseEntity<ApiResponse<CardDTO>> unblockCard(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(cardService.unblockCard(id), "Card unblocked successfully"));
    }

    @GetMapping("/{cardNumber}/transactions")
    public ResponseEntity<ApiResponse<Page<CardTransaction>>> getTransactions(
            @PathVariable String cardNumber,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(cardService.getCardTransactions(cardNumber, page, size), "Transactions retrieved"));
    }

    @GetMapping("/type/{cardType}")
    public ResponseEntity<ApiResponse<Page<CardDTO>>> getCardsByType(
            @PathVariable Card.CardType cardType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(cardService.getCardsByType(cardType, page, size), "Cards retrieved"));
    }

    @GetMapping("/stats/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success(cardService.getDashboardStats(), "Stats retrieved"));
    }
}
