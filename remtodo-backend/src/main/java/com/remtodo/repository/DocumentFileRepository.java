package com.remtodo.repository;

import com.remtodo.model.DocumentFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentFileRepository extends JpaRepository<DocumentFile, Long> {
    List<DocumentFile> findByUserIdOrderByUploadedAtDesc(Long userId);
}
