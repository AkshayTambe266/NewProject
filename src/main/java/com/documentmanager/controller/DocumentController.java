package com.documentmanager.controller;

import com.documentmanager.model.Document;
import com.documentmanager.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.IOException;
import java.util.Optional;

@Controller
public class DocumentController {
    
    @Autowired
    private DocumentService documentService;
    
    @GetMapping("/")
    public String index(@RequestParam(defaultValue = "0") int page, Model model) {
        Page<Document> documents = documentService.getAllDocuments(page, 5);
        
        model.addAttribute("documents", documents.getContent());
        model.addAttribute("currentPage", page);
        model.addAttribute("totalPages", documents.getTotalPages());
        model.addAttribute("totalElements", documents.getTotalElements());
        model.addAttribute("hasNext", documents.hasNext());
        model.addAttribute("hasPrevious", documents.hasPrevious());
        
        return "index";
    }
    
    @PostMapping("/upload")
    public String uploadDocument(@RequestParam("file") MultipartFile file, 
                                RedirectAttributes redirectAttributes) {
        if (file.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "Please select a file to upload");
            return "redirect:/";
        }
        
        try {
            Document document = documentService.saveDocument(file);
            redirectAttributes.addFlashAttribute("success", 
                "File '" + file.getOriginalFilename() + "' uploaded successfully!");
        } catch (IOException e) {
            redirectAttributes.addFlashAttribute("error", 
                "Failed to upload file: " + e.getMessage());
        }
        
        return "redirect:/";
    }
    
    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) {
        try {
            Optional<Document> documentOpt = documentService.getDocumentById(id);
            if (documentOpt.isPresent()) {
                Document document = documentOpt.get();
                byte[] content = documentService.getDocumentContent(id);
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(document.getContentType()));
                headers.setContentDispositionFormData("attachment", document.getOriginalFileName());
                headers.setContentLength(content.length);
                
                return new ResponseEntity<>(content, headers, HttpStatus.OK);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/view/{id}")
    public ResponseEntity<byte[]> viewDocument(@PathVariable Long id) {
        try {
            Optional<Document> documentOpt = documentService.getDocumentById(id);
            if (documentOpt.isPresent()) {
                Document document = documentOpt.get();
                byte[] content = documentService.getDocumentContent(id);
                
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType(document.getContentType()));
                headers.setContentDispositionFormData("inline", document.getOriginalFileName());
                
                return new ResponseEntity<>(content, headers, HttpStatus.OK);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        
        return ResponseEntity.notFound().build();
    }
    
    @PostMapping("/delete/{id}")
    public String deleteDocument(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        boolean deleted = documentService.deleteDocument(id);
        
        if (deleted) {
            redirectAttributes.addFlashAttribute("success", "Document deleted successfully!");
        } else {
            redirectAttributes.addFlashAttribute("error", "Failed to delete document");
        }
        
        return "redirect:/";
    }
}