package com.pharmacy.service;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pharmacy.dto.CategoryRequest;
import com.pharmacy.dto.CategoryResponse;
import com.pharmacy.entity.Category;
import com.pharmacy.exception.ConflictException;
import com.pharmacy.exception.ResourceNotFoundException;
import com.pharmacy.repository.CategoryRepository;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CategoryResponse getCategoryById(Long id) {
        Category category = findCategory(id);

        return toResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {

        String name = request.name().trim();

        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new ConflictException(
                    "Category with name '" + name + "' already exists"
            );
        }

        Category category = new Category(name);

        Category savedCategory = categoryRepository.save(category);

        return toResponse(savedCategory);
    }

    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {

        Category category = findCategory(id);

        String name = request.name().trim();

        if (categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
            throw new ConflictException(
                    "Category with name '" + name + "' already exists"
            );
        }

        category.setName(name);

        Category updatedCategory = categoryRepository.save(category);

        return toResponse(updatedCategory);
    }

    @Transactional
    public void deleteCategory(Long id) {

        Category category = findCategory(id);

        try {
            categoryRepository.delete(category);
            categoryRepository.flush();
        } catch (DataIntegrityViolationException exception) {
            throw new ConflictException(
                    "Category cannot be deleted because it is used by medicines"
            );
        }
    }

    private Category findCategory(Long id) {

        return categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Category with id " + id + " not found"
                        )
                );
    }

    private CategoryResponse toResponse(Category category) {

        return new CategoryResponse(
                category.getId(),
                category.getName()
        );
    }
}