package com.pharmacy.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.pharmacy.entity.Category;
import com.pharmacy.repository.CategoryRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public DataSeeder(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {

        if (categoryRepository.count() == 0) {

            List<Category> categories = List.of(
                    new Category("Tablet"),
                    new Category("Capsule"),
                    new Category("Syrup"),
                    new Category("Injection"),
                    new Category("Cream"),
                    new Category("Ointment"),
                    new Category("Drops"),
                    new Category("Powder")
            );

            categoryRepository.saveAll(categories);
        }
    }
}