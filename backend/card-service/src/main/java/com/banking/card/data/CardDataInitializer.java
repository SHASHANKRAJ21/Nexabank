package com.banking.card.data;

import com.banking.card.model.Card;
import com.banking.card.model.CardTransaction;
import com.banking.card.repository.CardRepository;
import com.banking.card.repository.CardTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class CardDataInitializer implements CommandLineRunner {

    private final CardRepository cardRepository;
    private final CardTransactionRepository txRepository;

    private static final String[] NAMES = {
        "Aarav Agarwal","Aditya Bansal","Akash Sharma","Amit Gupta","Ananya Singh","Ankit Verma",
        "Ankita Mishra","Arjun Reddy","Aryan Patel","Ayesha Khan","Bharat Mehta","Deepak Joshi",
        "Deepika Nair","Divya Pillai","Gaurav Rao","Ishaan Chauhan","Kajal Arora","Karan Kapoor",
        "Kavita Bhat","Kunal Jain","Lakshmi Iyer","Manish Das","Meera Roy","Mohit Tiwari",
        "Nandini Saxena","Neha Sinha","Nikhil Shukla","Nisha Malhotra","Pankaj Chandra","Pooja Dubey",
        "Priya Trivedi","Rahul Sharma","Rajesh Kumar","Ravi Varma","Rohit Singh","Sachin Patil",
        "Sanjay Desai","Sara Fernandez","Shweta Ahuja","Sneha Chopra","Sonam Bhatia","Suresh Dey",
        "Tanmay Ghosh","Tanya Goyal","Uday Kulkarni","Varun Mathur","Vijay Rastogi","Vikram Sen",
        "Virat Shah","Aisha Pandey","Ajay Yadav","Alok Dutta","Amrita Chawla","Anand Mukherjee",
        "Asha Choudhary","Ashok Dave","Avni Modi","Bhavna Khatri","Chirag Bajaj","Dhruv Bhattacharya",
        "Ekta Chatterjee","Farhan Chakraborty","Geeta Nayak","Harsh Sahoo","Hemant Pande",
        "Isha Jha","Jagdish Kaur","Jyoti Garg","Kapil Srivastava","Kavya Mishra","Khushi Pandey",
        "Komal Sharma","Krishna Verma","Leela Gupta","Madhur Singh","Mahi Agarwal","Mayank Patel",
        "Mihir Mehta","Mira Joshi","Mohan Reddy","Mukesh Arora","Nalini Kapoor","Namita Iyer",
        "Naveen Das","Neeraj Roy","Nilesh Tiwari","Nimesh Saxena","Nirmal Sinha","Nita Shukla",
        "Om Malhotra","Pallavi Chandra","Pawan Dubey","Pragya Trivedi","Pranav Kumar","Preet Varma",
        "Preeti Singh","Priyansh Patil","Purvi Desai","Raghu Ahuja","Rajiv Chopra","Rakesh Bhatia"
    };

    private static final String[] MERCHANTS = {
        "Amazon India","Flipkart","Swiggy","Zomato","BigBasket","Myntra","Nykaa","MakeMyTrip",
        "Yatra","IRCTC","BookMyShow","Uber","Ola","Paytm Mall","Reliance Digital","Croma",
        "DMart","More Supermarket","Spencer's","Star Bazaar","McDonald's","KFC","Domino's",
        "Pizza Hut","Cafe Coffee Day","Starbucks","Haldiram's","Bata","Woodland","Levis",
        "H&M","Zara","Lifestyle","Shoppers Stop","Pantaloons","HDFC Insurance","LIC","SBI Life"
    };

    private static final String[] CATEGORIES = {
        "E-commerce","Food & Dining","Grocery","Travel","Entertainment","Transport",
        "Fashion","Electronics","Insurance","Utilities","Healthcare","Education"
    };

    private final Random random = new Random(99);

    @Override
    public void run(String... args) {
        if (cardRepository.count() > 0) return;
        log.info("Seeding 1000 cards...");

        Card.CardType[] types = Card.CardType.values();
        Card.CardNetwork[] networks = Card.CardNetwork.values();
        Card.CardStatus[] statuses = {
            Card.CardStatus.ACTIVE, Card.CardStatus.ACTIVE, Card.CardStatus.ACTIVE,
            Card.CardStatus.BLOCKED, Card.CardStatus.EXPIRED, Card.CardStatus.ACTIVE
        };

        List<Card> cards = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            String name = NAMES[random.nextInt(NAMES.length)];
            Card.CardType type = types[random.nextInt(types.length)];
            Card.CardNetwork network = networks[random.nextInt(networks.length)];
            Card.CardStatus status = statuses[random.nextInt(statuses.length)];

            String rawCard = generateCardNumber(network);
            String masked = "****-****-****-" + rawCard.substring(rawCard.length() - 4);

            BigDecimal limit = type == Card.CardType.CREDIT
                    ? BigDecimal.valueOf(50000 + random.nextInt(950000)).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.valueOf(10000 + random.nextInt(90000)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal outstanding = type == Card.CardType.CREDIT
                    ? BigDecimal.valueOf(random.nextInt(limit.intValue())).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            BigDecimal available = limit.subtract(outstanding);

            LocalDate expiry = LocalDate.now().plusYears(1 + random.nextInt(5)).withDayOfMonth(28);
            LocalDate lastBilling = LocalDate.now().minusDays(random.nextInt(30));
            LocalDate nextBilling = lastBilling.plusDays(30);

            LocalDateTime created = LocalDateTime.now().minusDays(random.nextInt(1825));

            Card card = Card.builder()
                    .cardNumber(rawCard)
                    .maskedCardNumber(masked)
                    .customerName(name)
                    .accountNumber(String.format("ACC%010d", 1000000000L + i))
                    .email(name.toLowerCase().replace(" ", ".") + (i + 1) + "@email.com")
                    .cardType(type)
                    .network(network)
                    .creditLimit(limit)
                    .availableLimit(available)
                    .outstandingAmount(outstanding)
                    .expiryDate(expiry)
                    .cvv(String.format("%03d", random.nextInt(1000)))
                    .status(status)
                    .rewardPoints(String.valueOf(random.nextInt(50000)))
                    .lastBillingDate(lastBilling)
                    .nextBillingDate(nextBilling)
                    .createdAt(created)
                    .updatedAt(created.plusDays(random.nextInt(30)))
                    .build();
            cards.add(card);
        }

        cardRepository.saveAll(cards);
        log.info("Saved 1000 cards");

        List<CardTransaction> txs = new ArrayList<>();
        for (Card card : cards) {
            int count = 3 + random.nextInt(10);
            for (int j = 0; j < count; j++) {
                BigDecimal amount = BigDecimal.valueOf(50 + random.nextInt(20000))
                        .setScale(2, RoundingMode.HALF_UP);
                CardTransaction tx = CardTransaction.builder()
                        .transactionId(UUID.randomUUID().toString())
                        .cardNumber(card.getCardNumber())
                        .amount(amount)
                        .merchantName(MERCHANTS[random.nextInt(MERCHANTS.length)])
                        .merchantCategory(CATEGORIES[random.nextInt(CATEGORIES.length)])
                        .status(CardTransaction.TransactionStatus.SUCCESS)
                        .createdAt(card.getCreatedAt().plusDays(j + 1))
                        .build();
                txs.add(tx);
            }
        }
        txRepository.saveAll(txs);
        log.info("Saved {} card transactions", txs.size());
    }

    private String generateCardNumber(Card.CardNetwork network) {
        String prefix = switch (network) {
            case VISA -> "4";
            case MASTERCARD -> "5";
            case RUPAY -> "6";
            case AMEX -> "3";
        };
        StringBuilder sb = new StringBuilder(prefix);
        for (int i = sb.length(); i < 16; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }
}
