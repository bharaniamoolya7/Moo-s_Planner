package com.remtodo.controller;

import com.remtodo.model.DocumentFile;
import com.remtodo.repository.DocumentFileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentFileController {

    @Autowired
    private DocumentFileRepository repository;

    @GetMapping("/user/{userId}")
    public List<DocumentFile> getUserDocuments(@PathVariable Long userId) {
        return repository.findByUserIdOrderByUploadedAtDesc(userId);
    }

    @PostMapping
    public DocumentFile saveDocument(@RequestBody DocumentFile document) {
        return repository.save(document);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentFile> updateDocument(@PathVariable Long id, @RequestBody DocumentFile item) {
        return repository.findById(id).map(existing -> {
            existing.setName(item.getName());
            existing.setCategory(item.getCategory());
            existing.setStarred(item.isStarred());
            existing.setDescription(item.getDescription());
            return ResponseEntity.ok(repository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
