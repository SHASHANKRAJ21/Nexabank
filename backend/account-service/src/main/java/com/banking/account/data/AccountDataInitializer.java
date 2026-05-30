package com.banking.account.data;

import com.banking.account.model.Account;
import com.banking.account.model.Transaction;
import com.banking.account.model.User;
import com.banking.account.repository.AccountRepository;
import com.banking.account.repository.TransactionRepository;
import com.banking.account.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class AccountDataInitializer implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String[] FIRST_NAMES = {
        "Aarav","Aditya","Akash","Amit","Ananya","Ankit","Ankita","Anshul","Arjun","Aryan",
        "Ayesha","Bharat","Deepak","Deepika","Divya","Gaurav","Ishaan","Kajal","Karan","Kavita",
        "Kunal","Lakshmi","Manish","Meera","Mohit","Nandini","Neha","Nikhil","Nisha","Pankaj",
        "Pooja","Priya","Rahul","Rajesh","Ravi","Rohit","Sachin","Sanjay","Sara","Shweta",
        "Sneha","Sonam","Suresh","Tanmay","Tanya","Uday","Varun","Vijay","Vikram","Virat",
        "Aisha","Ajay","Alok","Amrita","Anand","Asha","Ashok","Avni","Bhavna","Chirag",
        "Dhruv","Ekta","Farhan","Geeta","Harsh","Hemant","Isha","Jagdish","Jyoti","Kapil",
        "Kavya","Khushi","Komal","Krishna","Leela","Madhur","Mahi","Mayank","Mihir","Mira",
        "Mohan","Mukesh","Nalini","Namita","Naveen","Neeraj","Nilesh","Nimesh","Nirmal","Nita",
        "Om","Pallavi","Pawan","Pragya","Pranav","Preet","Preeti","Priyansh","Purvi","Raghu",
        "Rajiv","Rakesh","Ramesh","Rashmi","Ratan","Rekha","Renu","Rita","Riya","Rohini",
        "Rupali","Sahil","Saksham","Salma","Sameer","Sangeeta","Sanjana","Santosh","Sanya","Sapna",
        "Sarita","Seema","Shailesh","Shakti","Shalini","Shamita","Shikha","Shilpa","Shivam","Shruti",
        "Sidharth","Simran","Smriti","Sonal","Sonia","Srishti","Sunil","Sunita","Sushmita","Swati",
        "Tarun","Tejal","Tejas","Tushar","Uma","Usha","Utkarsh","Vandana","Vivek","Yash"
    };

    private static final String[] LAST_NAMES = {
        "Agarwal","Ahuja","Arora","Bajaj","Bansal","Bhat","Bhatia","Bhattacharya","Chakraborty",
        "Chandra","Chatterjee","Chauhan","Chawla","Chopra","Choudhary","Das","Dave","Desai",
        "Deshpande","Dey","Dubey","Dutta","Fernandez","Garg","Ghosh","Goyal","Gupta","Iyer",
        "Jain","Jha","Joshi","Kapoor","Kaur","Khatri","Kulkarni","Kumar","Malhotra","Mathur",
        "Mehta","Mishra","Modi","Mukherjee","Nair","Nayak","Pande","Pandey","Patel","Patil",
        "Pillai","Rao","Rastogi","Reddy","Roy","Sahoo","Saxena","Sen","Shah","Sharma","Shukla",
        "Singh","Sinha","Srivastava","Tiwari","Trivedi","Varma","Verma","Yadav","Pillai","Menon"
    };

    private static final String[] CITIES = {
        "Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Kolkata","Pune","Ahmedabad",
        "Jaipur","Lucknow","Kanpur","Nagpur","Indore","Bhopal","Patna","Surat","Vadodara",
        "Coimbatore","Kochi","Visakhapatnam","Chandigarh","Nashik","Agra","Varanasi","Meerut"
    };

    private static final String[] STATES = {
        "Maharashtra","Delhi","Karnataka","Telangana","Tamil Nadu","West Bengal","Rajasthan",
        "Uttar Pradesh","Gujarat","Madhya Pradesh","Bihar","Andhra Pradesh","Punjab","Haryana",
        "Kerala"
    };

    private static final String[] BRANCHES = {
        "Main Branch","City Center Branch","Park Street Branch","MG Road Branch","Sector 17 Branch",
        "Andheri Branch","Koramangala Branch","Banjara Hills Branch","Anna Nagar Branch",
        "Salt Lake Branch","Civil Lines Branch","Connaught Place Branch"
    };

    private static final Account.AccountType[] ACCOUNT_TYPES = Account.AccountType.values();
    private static final Account.AccountStatus[] STATUSES = {
        Account.AccountStatus.ACTIVE, Account.AccountStatus.ACTIVE, Account.AccountStatus.ACTIVE,
        Account.AccountStatus.ACTIVE, Account.AccountStatus.INACTIVE, Account.AccountStatus.SUSPENDED
    };

    private final Random random = new Random(42);

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@nexabank.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            admin.setPhone("9997612862");   // real phone — OTP will be sent here
            userRepository.save(admin);
            log.info("Created admin (admin / admin123) phone: 9997612862");
        }

        if (!userRepository.existsByUsername("accounts_user")) {
            User u = new User();
            u.setUsername("accounts_user");
            u.setEmail("accounts@nexabank.com");
            u.setPassword(passwordEncoder.encode("acc123"));
            u.setRole(User.Role.ACCOUNTS_USER);
            u.setPhone("9000000001");
            userRepository.save(u);
            log.info("Created accounts_user (accounts_user / acc123)");
        }

        if (!userRepository.existsByUsername("cards_user")) {
            User u = new User();
            u.setUsername("cards_user");
            u.setEmail("cards@nexabank.com");
            u.setPassword(passwordEncoder.encode("card123"));
            u.setRole(User.Role.CARDS_USER);
            u.setPhone("9000000002");
            userRepository.save(u);
            log.info("Created cards_user (cards_user / card123)");
        }

        if (!userRepository.existsByUsername("loans_user")) {
            User u = new User();
            u.setUsername("loans_user");
            u.setEmail("loans@nexabank.com");
            u.setPassword(passwordEncoder.encode("loan123"));
            u.setRole(User.Role.LOANS_USER);
            u.setPhone("9000000003");
            userRepository.save(u);
            log.info("Created loans_user (loans_user / loan123)");
        }

        if (accountRepository.count() > 0) return;
        log.info("Seeding 1000 accounts...");

        List<Account> accounts = new ArrayList<>();
        for (int i = 0; i < 1000; i++) {
            String firstName = FIRST_NAMES[random.nextInt(FIRST_NAMES.length)];
            String lastName = LAST_NAMES[random.nextInt(LAST_NAMES.length)];
            String name = firstName + " " + lastName;
            int cityIdx = random.nextInt(CITIES.length);
            String city = CITIES[cityIdx];
            String state = STATES[cityIdx % STATES.length];
            String branch = BRANCHES[random.nextInt(BRANCHES.length)];
            Account.AccountType type = ACCOUNT_TYPES[random.nextInt(ACCOUNT_TYPES.length)];
            Account.AccountStatus status = STATUSES[random.nextInt(STATUSES.length)];
            BigDecimal balance = BigDecimal.valueOf(1000 + random.nextInt(4999000) / 100.0)
                    .setScale(2, RoundingMode.HALF_UP);
            String phone = "9" + String.format("%09d", random.nextInt(1000000000));
            String email = firstName.toLowerCase() + "." + lastName.toLowerCase() + (i + 1) + "@email.com";
            String accNum = String.format("ACC%010d", 1000000000L + i);
            String ifsc = "BANK0" + branch.substring(0, 3).toUpperCase().replaceAll(" ", "X")
                    + String.format("%04d", random.nextInt(10000));

            LocalDateTime created = LocalDateTime.now().minusDays(random.nextInt(1825)).minusHours(random.nextInt(24));

            Account account = Account.builder()
                    .accountNumber(accNum)
                    .customerName(name)
                    .email(email)
                    .phone(phone)
                    .accountType(type)
                    .balance(balance)
                    .status(status)
                    .ifscCode(ifsc)
                    .branchName(branch)
                    .city(city)
                    .state(state)
                    .createdAt(created)
                    .updatedAt(created.plusDays(random.nextInt(30)))
                    .build();
            accounts.add(account);
        }

        accountRepository.saveAll(accounts);
        log.info("Saved 1000 accounts");

        // Seed transactions for each account (3-10 per account)
        List<Transaction> transactions = new ArrayList<>();
        String[] txDescriptions = {
            "UPI Transfer","NEFT Payment","RTGS Transfer","ATM Withdrawal","Online Purchase",
            "EMI Debit","Salary Credit","Dividend Credit","Interest Credit","Insurance Premium",
            "Bill Payment","Refund","Cashback","Loan Disbursement","Rental Payment"
        };

        for (Account account : accounts) {
            int txCount = 3 + random.nextInt(8);
            BigDecimal running = account.getBalance();
            for (int j = 0; j < txCount; j++) {
                Transaction.TransactionType txType = random.nextBoolean()
                        ? Transaction.TransactionType.CREDIT : Transaction.TransactionType.DEBIT;
                BigDecimal amount = BigDecimal.valueOf(100 + random.nextInt(50000))
                        .setScale(2, RoundingMode.HALF_UP);
                if (txType == Transaction.TransactionType.DEBIT && running.compareTo(amount) < 0) {
                    txType = Transaction.TransactionType.CREDIT;
                }
                if (txType == Transaction.TransactionType.CREDIT) running = running.add(amount);
                else running = running.subtract(amount);

                Transaction tx = Transaction.builder()
                        .transactionId(UUID.randomUUID().toString())
                        .accountNumber(account.getAccountNumber())
                        .type(txType)
                        .amount(amount)
                        .balanceAfter(running)
                        .description(txDescriptions[random.nextInt(txDescriptions.length)])
                        .referenceNumber("REF" + System.nanoTime())
                        .status(Transaction.TransactionStatus.SUCCESS)
                        .createdAt(account.getCreatedAt().plusDays(j + 1))
                        .build();
                transactions.add(tx);
            }
        }

        transactionRepository.saveAll(transactions);
        log.info("Saved {} transactions", transactions.size());
    }
}
