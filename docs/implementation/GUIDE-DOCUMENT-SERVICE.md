# Document Service Implementation Guide

**Document Version**: 1.0
**Last Updated**: January 22, 2026
**Owner**: Platform Engineering Team
**Status**: Implementation Ready
**Estimated Timeline**: 3 weeks
**Impact**: 1% of platform completion (98% → 99%)

---

## Table of Contents

1. [Overview](#overview)
2. [Service Architecture](#service-architecture)
3. [Prerequisites](#prerequisites)
4. [Week 1: Core Implementation](#week-1-core-implementation)
5. [Week 2: Advanced Features](#week-2-advanced-features)
6. [Week 3: Testing & Deployment](#week-3-testing--deployment)
7. [API Specification](#api-specification)
8. [Storage Integration](#storage-integration)
9. [OCR & Processing](#ocr--processing)
10. [Security & Virus Scanning](#security--virus-scanning)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Procedures](#deployment-procedures)

---

## Overview

### Objective
Implement the Document Service microservice to handle all document storage, retrieval, processing, and management for the AuraOS platform.

### Service Characteristics
- **Technology Stack**: Go + Gin Framework
- **Communication**: REST API + gRPC
- **Storage**: S3/MinIO (object storage)
- **Port**: 3004
- **Replicas**: 3 (production)

### Key Features
- Document upload/download (multiple formats)
- Virus scanning with ClamAV
- OCR processing with Tesseract
- Document versioning
- Access control and permissions
- Preview generation (thumbnails, PDFs)
- Full-text search in documents
- Document metadata extraction

### Performance Targets
- **Upload (10MB)**: < 2 seconds (p95)
- **Download**: < 500ms (p95)
- **OCR Processing**: < 10 seconds for standard page (p95)
- **Virus Scan**: < 3 seconds (p95)
- **Availability**: 99.95%
- **Error Rate**: < 0.1%

---

## Service Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Kong API Gateway                       │
└────────────┬────────────────────────────────────────────┘
             │
             ▼
    ┌────────────────────┐
    │ Document Service   │
    │   (Go + Gin)       │
    │   Port: 3004       │
    └────┬───────┬───────┬────┘
         │       │       │
         ▼       ▼       ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │MinIO/S3│ │ClamAV  │ │Tesseract│
    │(Storage│ │(Virus  │ │(OCR)   │
    │)       │ │Scan)   │ │        │
    └────────┘ └────────┘ └────────┘
         │
         ▼
    ┌────────────────────┐
    │   PostgreSQL       │
    │ (Metadata & Index) │
    └────────────────────┘
```

### Technology Stack

**Backend Framework**: Go 1.21+ with Gin
- High performance
- Low memory footprint
- Excellent concurrency support
- Fast binary compilation

**Storage**: MinIO (S3-compatible)
- Self-hosted S3-compatible storage
- Bucket-based organization
- Versioning support
- Encryption at rest

**Virus Scanning**: ClamAV
- Open-source antivirus
- Real-time scanning
- Regular signature updates

**OCR Engine**: Tesseract 5.x
- Multi-language support
- PDF text extraction
- Image text extraction

**Database**: PostgreSQL 15
- Document metadata
- Version history
- Access control lists

**Cache**: Redis 7.x
- Temporary upload storage
- Download URL caching
- Rate limiting

---

## Prerequisites

### Development Environment Setup

**1. Install Go**:
```bash
# Install Go 1.21+
go version  # Should be 1.21+

# Set up Go workspace
mkdir -p ~/go/src/github.com/auraos
cd ~/go/src/github.com/auraos
```

**2. Install Dependencies**:
```bash
# Install ClamAV
# Ubuntu/Debian
sudo apt-get install clamav clamav-daemon

# macOS
brew install clamav

# Start ClamAV daemon
sudo systemctl start clamav-daemon

# Update virus definitions
sudo freshclam
```

```bash
# Install Tesseract
# Ubuntu/Debian
sudo apt-get install tesseract-ocr tesseract-ocr-eng

# macOS
brew install tesseract

# Verify installation
tesseract --version
```

**3. Set Up MinIO**:
```bash
# Using Docker
docker run --name document-minio \
  -e "MINIO_ROOT_USER=admin" \
  -e "MINIO_ROOT_PASSWORD=admin123" \
  -p 9000:9000 \
  -p 9001:9001 \
  -d minio/minio server /data --console-address ":9001"

# Create buckets
# Access MinIO console: http://localhost:9001
# Username: admin, Password: admin123
# Create buckets: documents, thumbnails, temp
```

**4. Set Up PostgreSQL**:
```bash
docker run --name document-postgres \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin123 \
  -e POSTGRES_DB=document_dev \
  -p 5435:5432 \
  -d postgres:15
```

**5. Set Up Redis**:
```bash
docker run --name document-redis \
  -p 6382:6379 \
  -d redis:7-alpine
```

**6. Clone Service Repository**:
```bash
cd services/document-service/

# Initialize Go module
go mod init github.com/auraos/document-service

# Install dependencies
go get -u github.com/gin-gonic/gin
go get -u github.com/minio/minio-go/v7
go get -u github.com/lib/pq
go get -u github.com/go-redis/redis/v8
go get -u google.golang.org/grpc
```

**7. Configure Environment Variables**:
```bash
# services/document-service/.env.development

# Database
DATABASE_URL="postgres://admin:admin123@localhost:5435/document_dev?sslmode=disable"

# MinIO/S3
MINIO_ENDPOINT="localhost:9000"
MINIO_ACCESS_KEY="admin"
MINIO_SECRET_KEY="admin123"
MINIO_USE_SSL="false"
MINIO_BUCKET_DOCUMENTS="documents"
MINIO_BUCKET_THUMBNAILS="thumbnails"

# ClamAV
CLAMAV_HOST="localhost"
CLAMAV_PORT="3310"
CLAMAV_ENABLED="true"

# Tesseract
TESSERACT_PATH="/usr/bin/tesseract"
TESSERACT_LANG="eng"
OCR_ENABLED="true"

# Redis
REDIS_HOST="localhost"
REDIS_PORT="6382"

# Service
PORT="3004"
ENV="development"
LOG_LEVEL="debug"

# Security
MAX_FILE_SIZE="104857600"  # 100MB in bytes
ALLOWED_EXTENSIONS=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
ENABLE_VIRUS_SCAN="true"
```

---

## Week 1: Core Implementation

### Day 1-2: Project Structure & Basic Upload/Download

**1. Create Project Structure**:
```
services/document-service/
├── main.go
├── go.mod
├── go.sum
├── config/
│   ├── config.go
│   ├── database.go
│   ├── minio.go
│   └── redis.go
├── internal/
│   ├── handlers/
│   │   ├── document.go
│   │   ├── upload.go
│   │   ├── download.go
│   │   └── health.go
│   ├── models/
│   │   ├── document.go
│   │   └── version.go
│   ├── services/
│   │   ├── storage.go
│   │   ├── virus-scan.go
│   │   ├── ocr.go
│   │   └── thumbnail.go
│   ├── middleware/
│   │   ├── auth.go
│   │   ├── logger.go
│   │   └── cors.go
│   └── utils/
│       ├── validator.go
│       └── mime.go
├── proto/
│   └── document.proto
├── db/
│   └── migrations/
│       └── 001_init.sql
└── test/
    ├── unit/
    ├── integration/
    └── e2e/
```

**2. Implement Main Application**:

**File**: `main.go`
```go
package main

import (
    "log"
    "os"

    "github.com/auraos/document-service/config"
    "github.com/auraos/document-service/internal/handlers"
    "github.com/auraos/document-service/internal/middleware"
    "github.com/gin-gonic/gin"
)

func main() {
    // Load configuration
    cfg, err := config.Load()
    if err != nil {
        log.Fatalf("Failed to load configuration: %v", err)
    }

    // Initialize database
    db, err := config.InitDatabase(cfg)
    if err != nil {
        log.Fatalf("Failed to initialize database: %v", err)
    }
    defer db.Close()

    // Initialize MinIO
    minioClient, err := config.InitMinio(cfg)
    if err != nil {
        log.Fatalf("Failed to initialize MinIO: %v", err)
    }

    // Initialize Redis
    redisClient := config.InitRedis(cfg)
    defer redisClient.Close()

    // Create Gin router
    router := gin.Default()

    // Middleware
    router.Use(middleware.Logger())
    router.Use(middleware.CORS())
    router.Use(middleware.Auth())

    // Health check
    router.GET("/health", handlers.HealthCheck)

    // API routes
    api := router.Group("/api/v1")
    {
        documents := api.Group("/documents")
        {
            documents.POST("/upload", handlers.UploadDocument(cfg, minioClient, db))
            documents.GET("/:id", handlers.GetDocument(db, minioClient))
            documents.GET("/:id/download", handlers.DownloadDocument(db, minioClient))
            documents.PUT("/:id", handlers.UpdateDocument(db))
            documents.DELETE("/:id", handlers.DeleteDocument(db, minioClient))
            documents.GET("/", handlers.ListDocuments(db))
            documents.POST("/:id/versions", handlers.CreateVersion(cfg, minioClient, db))
            documents.GET("/:id/versions", handlers.GetVersions(db))
        }
    }

    // Start server
    port := os.Getenv("PORT")
    if port == "" {
        port = "3004"
    }

    log.Printf("🚀 Document Service running on port %s", port)
    if err := router.Run(":" + port); err != nil {
        log.Fatalf("Failed to start server: %v", err)
    }
}
```

**3. Implement Document Model**:

**File**: `internal/models/document.go`
```go
package models

import (
    "time"
)

type Document struct {
    ID              string    `json:"id" db:"id"`
    TenantID        string    `json:"tenantId" db:"tenant_id"`
    Name            string    `json:"name" db:"name"`
    OriginalName    string    `json:"originalName" db:"original_name"`
    MimeType        string    `json:"mimeType" db:"mime_type"`
    Size            int64     `json:"size" db:"size"`
    StoragePath     string    `json:"storagePath" db:"storage_path"`
    BucketName      string    `json:"bucketName" db:"bucket_name"`
    Version         int       `json:"version" db:"version"`
    IsVirusFree     bool      `json:"isVirusFree" db:"is_virus_free"`
    OcrText         string    `json:"ocrText,omitempty" db:"ocr_text"`
    ThumbnailPath   string    `json:"thumbnailPath,omitempty" db:"thumbnail_path"`
    Metadata        string    `json:"metadata,omitempty" db:"metadata"` // JSON
    UploadedBy      string    `json:"uploadedBy" db:"uploaded_by"`
    CreatedAt       time.Time `json:"createdAt" db:"created_at"`
    UpdatedAt       time.Time `json:"updatedAt" db:"updated_at"`
}

type DocumentVersion struct {
    ID          string    `json:"id" db:"id"`
    DocumentID  string    `json:"documentId" db:"document_id"`
    Version     int       `json:"version" db:"version"`
    StoragePath string    `json:"storagePath" db:"storage_path"`
    Size        int64     `json:"size" db:"size"`
    UploadedBy  string    `json:"uploadedBy" db:"uploaded_by"`
    CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}
```

**4. Implement Upload Handler**:

**File**: `internal/handlers/upload.go`
```go
package handlers

import (
    "context"
    "fmt"
    "io"
    "net/http"
    "path/filepath"
    "time"

    "github.com/auraos/document-service/config"
    "github.com/auraos/document-service/internal/models"
    "github.com/auraos/document-service/internal/services"
    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    "github.com/minio/minio-go/v7"
)

func UploadDocument(cfg *config.Config, minioClient *minio.Client, db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // Get tenant ID from context (set by auth middleware)
        tenantID := c.GetString("tenantId")
        userID := c.GetString("userId")

        // Parse multipart form
        file, header, err := c.Request.FormFile("file")
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{
                "error": "File is required",
            })
            return
        }
        defer file.Close()

        // Validate file size
        if header.Size > cfg.MaxFileSize {
            c.JSON(http.StatusBadRequest, gin.H{
                "error": fmt.Sprintf("File size exceeds maximum allowed (%d bytes)", cfg.MaxFileSize),
            })
            return
        }

        // Validate file extension
        ext := filepath.Ext(header.Filename)
        if !services.IsAllowedExtension(ext, cfg.AllowedExtensions) {
            c.JSON(http.StatusBadRequest, gin.H{
                "error": fmt.Sprintf("File extension %s is not allowed", ext),
            })
            return
        }

        // Generate document ID and storage path
        docID := uuid.New().String()
        storagePath := fmt.Sprintf("%s/%s%s", tenantID, docID, ext)

        // Read file into memory (for virus scanning)
        fileBytes, err := io.ReadAll(file)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Failed to read file",
            })
            return
        }

        // Virus scan
        if cfg.EnableVirusScan {
            isClean, err := services.ScanForVirus(fileBytes, cfg)
            if err != nil {
                c.JSON(http.StatusInternalServerError, gin.H{
                    "error": "Virus scan failed",
                })
                return
            }

            if !isClean {
                c.JSON(http.StatusBadRequest, gin.H{
                    "error": "File contains malware and was rejected",
                })
                return
            }
        }

        // Upload to MinIO
        ctx := context.Background()
        _, err = minioClient.PutObject(
            ctx,
            cfg.MinioBucketDocuments,
            storagePath,
            bytes.NewReader(fileBytes),
            header.Size,
            minio.PutObjectOptions{
                ContentType: header.Header.Get("Content-Type"),
            },
        )
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Failed to upload file",
            })
            return
        }

        // Save metadata to database
        doc := &models.Document{
            ID:           docID,
            TenantID:     tenantID,
            Name:         header.Filename,
            OriginalName: header.Filename,
            MimeType:     header.Header.Get("Content-Type"),
            Size:         header.Size,
            StoragePath:  storagePath,
            BucketName:   cfg.MinioBucketDocuments,
            Version:      1,
            IsVirusFree:  true,
            UploadedBy:   userID,
            CreatedAt:    time.Now(),
            UpdatedAt:    time.Now(),
        }

        _, err = db.ExecContext(
            ctx,
            `INSERT INTO documents (id, tenant_id, name, original_name, mime_type, size, storage_path, bucket_name, version, is_virus_free, uploaded_by, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            doc.ID, doc.TenantID, doc.Name, doc.OriginalName, doc.MimeType, doc.Size,
            doc.StoragePath, doc.BucketName, doc.Version, doc.IsVirusFree, doc.UploadedBy,
            doc.CreatedAt, doc.UpdatedAt,
        )
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Failed to save document metadata",
            })
            return
        }

        // Trigger async OCR processing (if enabled and applicable)
        if cfg.OCREnabled && services.IsOCRSupported(ext) {
            go services.ProcessOCR(docID, storagePath, cfg, minioClient, db)
        }

        // Trigger thumbnail generation (if applicable)
        if services.IsThumbnailSupported(ext) {
            go services.GenerateThumbnail(docID, storagePath, cfg, minioClient, db)
        }

        c.JSON(http.StatusCreated, gin.H{
            "success": true,
            "data":    doc,
        })
    }
}
```

**5. Implement Download Handler**:

**File**: `internal/handlers/download.go`
```go
package handlers

import (
    "database/sql"
    "net/http"

    "github.com/auraos/document-service/internal/models"
    "github.com/gin-gonic/gin"
    "github.com/minio/minio-go/v7"
)

func DownloadDocument(db *sql.DB, minioClient *minio.Client) gin.HandlerFunc {
    return func(c *gin.Context) {
        docID := c.Param("id")
        tenantID := c.GetString("tenantId")

        // Fetch document metadata
        var doc models.Document
        err := db.QueryRowContext(
            c.Request.Context(),
            `SELECT id, tenant_id, name, storage_path, bucket_name, mime_type
             FROM documents
             WHERE id = $1 AND tenant_id = $2`,
            docID, tenantID,
        ).Scan(&doc.ID, &doc.TenantID, &doc.Name, &doc.StoragePath, &doc.BucketName, &doc.MimeType)

        if err == sql.ErrNoRows {
            c.JSON(http.StatusNotFound, gin.H{
                "error": "Document not found",
            })
            return
        } else if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Failed to fetch document",
            })
            return
        }

        // Get object from MinIO
        object, err := minioClient.GetObject(
            c.Request.Context(),
            doc.BucketName,
            doc.StoragePath,
            minio.GetObjectOptions{},
        )
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Failed to retrieve document",
            })
            return
        }
        defer object.Close()

        // Set headers
        c.Header("Content-Type", doc.MimeType)
        c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", doc.Name))

        // Stream file to response
        _, err = io.Copy(c.Writer, object)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Failed to download document",
            })
            return
        }
    }
}
```

### Day 3-4: Virus Scanning Integration

**File**: `internal/services/virus-scan.go`
```go
package services

import (
    "bytes"
    "fmt"
    "io"
    "net"
    "strings"

    "github.com/auraos/document-service/config"
)

func ScanForVirus(fileData []byte, cfg *config.Config) (bool, error) {
    // Connect to ClamAV daemon
    conn, err := net.Dial("tcp", fmt.Sprintf("%s:%s", cfg.ClamAVHost, cfg.ClamAVPort))
    if err != nil {
        return false, fmt.Errorf("failed to connect to ClamAV: %w", err)
    }
    defer conn.Close()

    // Send INSTREAM command
    _, err = conn.Write([]byte("zINSTREAM\x00"))
    if err != nil {
        return false, fmt.Errorf("failed to send INSTREAM command: %w", err)
    }

    // Send file data in chunks
    chunkSize := 4096
    for i := 0; i < len(fileData); i += chunkSize {
        end := i + chunkSize
        if end > len(fileData) {
            end = len(fileData)
        }

        chunk := fileData[i:end]
        chunkLen := uint32(len(chunk))

        // Send chunk length (big-endian)
        lengthBytes := []byte{
            byte(chunkLen >> 24),
            byte(chunkLen >> 16),
            byte(chunkLen >> 8),
            byte(chunkLen),
        }

        _, err = conn.Write(lengthBytes)
        if err != nil {
            return false, fmt.Errorf("failed to send chunk length: %w", err)
        }

        // Send chunk data
        _, err = conn.Write(chunk)
        if err != nil {
            return false, fmt.Errorf("failed to send chunk: %w", err)
        }
    }

    // Send terminating chunk (length = 0)
    _, err = conn.Write([]byte{0, 0, 0, 0})
    if err != nil {
        return false, fmt.Errorf("failed to send terminating chunk: %w", err)
    }

    // Read response
    response := make([]byte, 1024)
    n, err := conn.Read(response)
    if err != nil && err != io.EOF {
        return false, fmt.Errorf("failed to read response: %w", err)
    }

    responseStr := string(response[:n])

    // Check response
    if strings.Contains(responseStr, "OK") {
        return true, nil // File is clean
    } else if strings.Contains(responseStr, "FOUND") {
        return false, nil // Virus detected
    } else {
        return false, fmt.Errorf("unexpected ClamAV response: %s", responseStr)
    }
}
```

### Day 5-6: OCR Processing

**File**: `internal/services/ocr.go`
```go
package services

import (
    "bytes"
    "context"
    "database/sql"
    "fmt"
    "io"
    "os"
    "os/exec"
    "path/filepath"

    "github.com/auraos/document-service/config"
    "github.com/minio/minio-go/v7"
)

func IsOCRSupported(ext string) bool {
    supportedExts := []string{".pdf", ".jpg", ".jpeg", ".png", ".tiff", ".tif"}
    for _, supported := range supportedExts {
        if ext == supported {
            return true
        }
    }
    return false
}

func ProcessOCR(docID, storagePath string, cfg *config.Config, minioClient *minio.Client, db *sql.DB) {
    ctx := context.Background()

    // Download document from MinIO
    object, err := minioClient.GetObject(ctx, cfg.MinioBucketDocuments, storagePath, minio.GetObjectOptions{})
    if err != nil {
        fmt.Printf("Failed to get document for OCR: %v\n", err)
        return
    }
    defer object.Close()

    // Save to temporary file
    tmpFile, err := os.CreateTemp("", "ocr-*"+filepath.Ext(storagePath))
    if err != nil {
        fmt.Printf("Failed to create temp file for OCR: %v\n", err)
        return
    }
    defer os.Remove(tmpFile.Name())

    _, err = io.Copy(tmpFile, object)
    if err != nil {
        fmt.Printf("Failed to write temp file for OCR: %v\n", err)
        return
    }
    tmpFile.Close()

    // Run Tesseract OCR
    outputFile := tmpFile.Name() + "_output"
    cmd := exec.Command(
        cfg.TesseractPath,
        tmpFile.Name(),
        outputFile,
        "-l", cfg.TesseractLang,
    )

    var stderr bytes.Buffer
    cmd.Stderr = &stderr

    err = cmd.Run()
    if err != nil {
        fmt.Printf("Tesseract OCR failed: %v, stderr: %s\n", err, stderr.String())
        return
    }

    // Read OCR output
    ocrText, err := os.ReadFile(outputFile + ".txt")
    if err != nil {
        fmt.Printf("Failed to read OCR output: %v\n", err)
        return
    }
    defer os.Remove(outputFile + ".txt")

    // Update document with OCR text
    _, err = db.ExecContext(
        ctx,
        `UPDATE documents SET ocr_text = $1 WHERE id = $2`,
        string(ocrText), docID,
    )
    if err != nil {
        fmt.Printf("Failed to update document with OCR text: %v\n", err)
        return
    }

    fmt.Printf("✅ OCR completed for document %s\n", docID)
}
```

### Day 7: Thumbnail Generation

**File**: `internal/services/thumbnail.go`
```go
package services

import (
    "bytes"
    "context"
    "database/sql"
    "fmt"
    "image"
    "image/jpeg"
    "image/png"
    "io"
    "os"
    "os/exec"
    "path/filepath"

    "github.com/auraos/document-service/config"
    "github.com/minio/minio-go/v7"
    "github.com/nfnt/resize"
)

func IsThumbnailSupported(ext string) bool {
    supportedExts := []string{".pdf", ".jpg", ".jpeg", ".png", ".gif"}
    for _, supported := range supportedExts {
        if ext == supported {
            return true
        }
    }
    return false
}

func GenerateThumbnail(docID, storagePath string, cfg *config.Config, minioClient *minio.Client, db *sql.DB) {
    ctx := context.Background()
    ext := filepath.Ext(storagePath)

    // Download document
    object, err := minioClient.GetObject(ctx, cfg.MinioBucketDocuments, storagePath, minio.GetObjectOptions{})
    if err != nil {
        fmt.Printf("Failed to get document for thumbnail: %v\n", err)
        return
    }
    defer object.Close()

    var thumbnailData []byte

    if ext == ".pdf" {
        // Generate PDF thumbnail using ImageMagick convert
        thumbnailData, err = generatePDFThumbnail(object)
        if err != nil {
            fmt.Printf("Failed to generate PDF thumbnail: %v\n", err)
            return
        }
    } else {
        // Generate image thumbnail
        thumbnailData, err = generateImageThumbnail(object, ext)
        if err != nil {
            fmt.Printf("Failed to generate image thumbnail: %v\n", err)
            return
        }
    }

    // Upload thumbnail to MinIO
    thumbnailPath := fmt.Sprintf("thumbnails/%s.jpg", docID)
    _, err = minioClient.PutObject(
        ctx,
        cfg.MinioBucketThumbnails,
        thumbnailPath,
        bytes.NewReader(thumbnailData),
        int64(len(thumbnailData)),
        minio.PutObjectOptions{
            ContentType: "image/jpeg",
        },
    )
    if err != nil {
        fmt.Printf("Failed to upload thumbnail: %v\n", err)
        return
    }

    // Update document with thumbnail path
    _, err = db.ExecContext(
        ctx,
        `UPDATE documents SET thumbnail_path = $1 WHERE id = $2`,
        thumbnailPath, docID,
    )
    if err != nil {
        fmt.Printf("Failed to update document with thumbnail path: %v\n", err)
        return
    }

    fmt.Printf("✅ Thumbnail generated for document %s\n", docID)
}

func generateImageThumbnail(reader io.Reader, ext string) ([]byte, error) {
    // Decode image
    var img image.Image
    var err error

    switch ext {
    case ".jpg", ".jpeg":
        img, err = jpeg.Decode(reader)
    case ".png":
        img, err = png.Decode(reader)
    default:
        return nil, fmt.Errorf("unsupported image format: %s", ext)
    }

    if err != nil {
        return nil, err
    }

    // Resize to 200x200 thumbnail
    thumbnail := resize.Thumbnail(200, 200, img, resize.Lanczos3)

    // Encode to JPEG
    var buf bytes.Buffer
    err = jpeg.Encode(&buf, thumbnail, &jpeg.Options{Quality: 85})
    if err != nil {
        return nil, err
    }

    return buf.Bytes(), nil
}

func generatePDFThumbnail(reader io.Reader) ([]byte, error) {
    // Save PDF to temp file
    tmpFile, err := os.CreateTemp("", "pdf-*.pdf")
    if err != nil {
        return nil, err
    }
    defer os.Remove(tmpFile.Name())

    _, err = io.Copy(tmpFile, reader)
    if err != nil {
        return nil, err
    }
    tmpFile.Close()

    // Use ImageMagick convert to generate thumbnail
    outputFile := tmpFile.Name() + "_thumb.jpg"
    cmd := exec.Command(
        "convert",
        tmpFile.Name()+"[0]", // First page only
        "-thumbnail", "200x200",
        "-quality", "85",
        outputFile,
    )

    err = cmd.Run()
    if err != nil {
        return nil, err
    }
    defer os.Remove(outputFile)

    // Read thumbnail
    thumbnailData, err := os.ReadFile(outputFile)
    if err != nil {
        return nil, err
    }

    return thumbnailData, nil
}
```

---

## Week 2: Advanced Features

### Day 8-9: Document Versioning

**File**: `internal/handlers/version.go`
```go
package handlers

import (
    "context"
    "database/sql"
    "fmt"
    "net/http"
    "time"

    "github.com/auraos/document-service/config"
    "github.com/auraos/document-service/internal/models"
    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    "github.com/minio/minio-go/v7"
)

func CreateVersion(cfg *config.Config, minioClient *minio.Client, db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        docID := c.Param("id")
        tenantID := c.GetString("tenantId")
        userID := c.GetString("userId")

        // Parse multipart form
        file, header, err := c.Request.FormFile("file")
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{
                "error": "File is required",
            })
            return
        }
        defer file.Close()

        // Get current document
        var doc models.Document
        err = db.QueryRowContext(
            c.Request.Context(),
            `SELECT id, tenant_id, version FROM documents WHERE id = $1 AND tenant_id = $2`,
            docID, tenantID,
        ).Scan(&doc.ID, &doc.TenantID, &doc.Version)

        if err == sql.ErrNoRows {
            c.JSON(http.StatusNotFound, gin.H{
                "error": "Document not found",
            })
            return
        } else if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Failed to fetch document",
            })
            return
        }

        // New version number
        newVersion := doc.Version + 1

        // Generate storage path for new version
        ext := filepath.Ext(header.Filename)
        versionPath := fmt.Sprintf("%s/%s_v%d%s", tenantID, docID, newVersion, ext)

        // Upload new version to MinIO
        ctx := context.Background()
        _, err = minioClient.PutObject(
            ctx,
            cfg.MinioBucketDocuments,
            versionPath,
            file,
            header.Size,
            minio.PutObjectOptions{
                ContentType: header.Header.Get("Content-Type"),
            },
        )
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Failed to upload new version",
            })
            return
        }

        // Create version record
        versionID := uuid.New().String()
        _, err = db.ExecContext(
            ctx,
            `INSERT INTO document_versions (id, document_id, version, storage_path, size, uploaded_by, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            versionID, docID, newVersion, versionPath, header.Size, userID, time.Now(),
        )
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Failed to create version record",
            })
            return
        }

        // Update document with new version
        _, err = db.ExecContext(
            ctx,
            `UPDATE documents SET version = $1, storage_path = $2, size = $3, updated_at = $4 WHERE id = $5`,
            newVersion, versionPath, header.Size, time.Now(), docID,
        )
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Failed to update document version",
            })
            return
        }

        c.JSON(http.StatusCreated, gin.H{
            "success": true,
            "data": gin.H{
                "documentId": docID,
                "version":    newVersion,
            },
        })
    }
}

func GetVersions(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        docID := c.Param("id")
        tenantID := c.GetString("tenantId")

        // Verify document belongs to tenant
        var count int
        err := db.QueryRowContext(
            c.Request.Context(),
            `SELECT COUNT(*) FROM documents WHERE id = $1 AND tenant_id = $2`,
            docID, tenantID,
        ).Scan(&count)

        if err != nil || count == 0 {
            c.JSON(http.StatusNotFound, gin.H{
                "error": "Document not found",
            })
            return
        }

        // Get all versions
        rows, err := db.QueryContext(
            c.Request.Context(),
            `SELECT id, document_id, version, storage_path, size, uploaded_by, created_at
             FROM document_versions
             WHERE document_id = $1
             ORDER BY version DESC`,
            docID,
        )
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{
                "error": "Failed to fetch versions",
            })
            return
        }
        defer rows.Close()

        var versions []models.DocumentVersion
        for rows.Next() {
            var v models.DocumentVersion
            err := rows.Scan(&v.ID, &v.DocumentID, &v.Version, &v.StoragePath, &v.Size, &v.UploadedBy, &v.CreatedAt)
            if err != nil {
                continue
            }
            versions = append(versions, v)
        }

        c.JSON(http.StatusOK, gin.H{
            "success": true,
            "data":    versions,
        })
    }
}
```

### Day 10-11: gRPC Service

**File**: `proto/document.proto`
```protobuf
syntax = "proto3";

package document;

option go_package = "github.com/auraos/document-service/proto";

service DocumentService {
  rpc GetDocument (GetDocumentRequest) returns (DocumentResponse);
  rpc ListDocuments (ListDocumentsRequest) returns (ListDocumentsResponse);
  rpc DeleteDocument (DeleteDocumentRequest) returns (DeleteDocumentResponse);
}

message GetDocumentRequest {
  string tenant_id = 1;
  string id = 2;
}

message ListDocumentsRequest {
  string tenant_id = 1;
  int32 page = 2;
  int32 limit = 3;
}

message DeleteDocumentRequest {
  string tenant_id = 1;
  string id = 2;
}

message DocumentResponse {
  string id = 1;
  string tenant_id = 2;
  string name = 3;
  string mime_type = 4;
  int64 size = 5;
  int32 version = 6;
  bool is_virus_free = 7;
  string created_at = 8;
}

message ListDocumentsResponse {
  repeated DocumentResponse documents = 1;
  int32 total = 2;
}

message DeleteDocumentResponse {
  bool success = 1;
}
```

### Day 12-14: Full-Text Search

Implement full-text search using PostgreSQL's `tsvector`:

```sql
-- Add tsvector column
ALTER TABLE documents ADD COLUMN search_vector tsvector;

-- Create GIN index
CREATE INDEX idx_documents_search ON documents USING GIN(search_vector);

-- Update search vector
UPDATE documents SET search_vector =
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(ocr_text, ''));

-- Search query
SELECT * FROM documents
WHERE tenant_id = $1
  AND search_vector @@ to_tsquery('english', $2)
ORDER BY ts_rank(search_vector, to_tsquery('english', $2)) DESC;
```

---

## Week 3: Testing & Deployment

### Day 15-18: Comprehensive Testing

Create tests following [TESTING-STANDARDS.md](d:\KreupAI\KreupAI.AuraOS\docs\testing\TESTING-STANDARDS.md):

**Unit Tests**: `test/unit/`
**Integration Tests**: `test/integration/`
**E2E Tests**: `test/e2e/`

**Target Coverage**: 80% (High priority module)

Run tests:
```bash
go test ./... -v
go test ./... -cover
go test ./... -race
```

### Day 19-21: Deployment

**1. Build Docker Image**:
```bash
cd services/document-service/

docker build -t document-service:1.0.0 .
docker tag document-service:1.0.0 your-registry/document-service:1.0.0
docker push your-registry/document-service:1.0.0
```

**2. Deploy to Kubernetes**:
```bash
kubectl apply -f k8s/document-service-deployment.yaml
kubectl apply -f k8s/document-service-service.yaml
kubectl apply -f k8s/minio-deployment.yaml
kubectl apply -f k8s/clamav-deployment.yaml
```

**3. Start Traffic Migration** (Strangler Fig pattern):
- Week 1: 10% traffic
- Week 2: 50% traffic
- Week 3: 100% traffic

---

## API Specification

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/documents/upload | Upload document |
| GET | /api/v1/documents/:id | Get document metadata |
| GET | /api/v1/documents/:id/download | Download document |
| PUT | /api/v1/documents/:id | Update document metadata |
| DELETE | /api/v1/documents/:id | Delete document |
| GET | /api/v1/documents | List/search documents |
| POST | /api/v1/documents/:id/versions | Create new version |
| GET | /api/v1/documents/:id/versions | Get version history |

---

## Database Schema

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  bucket_name VARCHAR(100) NOT NULL,
  version INTEGER DEFAULT 1,
  is_virus_free BOOLEAN DEFAULT false,
  ocr_text TEXT,
  thumbnail_path VARCHAR(500),
  metadata JSONB,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE document_versions (
  id UUID PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  size BIGINT NOT NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_documents_tenant ON documents(tenant_id);
CREATE INDEX idx_documents_created ON documents(created_at);
CREATE INDEX idx_document_versions_doc ON document_versions(document_id);
```

---

## Success Criteria

**Completion Checklist**:
- [ ] All 8 API endpoints implemented and tested
- [ ] MinIO storage integration operational
- [ ] ClamAV virus scanning functional
- [ ] Tesseract OCR processing working
- [ ] Thumbnail generation implemented
- [ ] Document versioning operational
- [ ] gRPC service functional
- [ ] Full-text search implemented
- [ ] Unit tests: 80% coverage
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Security tests passing
- [ ] Docker image built
- [ ] Deployed to Kubernetes
- [ ] Kong routing configured
- [ ] Datadog monitoring active
- [ ] Documentation complete

---

**Platform Progress**: 98% → 99% ✅

**Next Steps**: Proceed to [Payroll Service Implementation Guide](./GUIDE-PAYROLL-SERVICE.md)
