# Document Manager Application

A Spring Boot web application for uploading, viewing, and managing documents with pagination support.

## Features

- 📤 **Document Upload**: Upload documents of various formats (PDF, images, text files, etc.)
- 👁️ **Document Viewing**: View documents directly in the browser
- ⬇️ **Document Download**: Download uploaded documents
- 🗑️ **Document Deletion**: Delete unwanted documents
- 📄 **Pagination**: Navigate through documents with 5 documents per page
- 💾 **Database Storage**: Uses MySQL for storing document metadata
- 🎨 **Modern UI**: Clean and responsive HTML/CSS interface

## Technology Stack

- **Backend**: Spring Boot 3.2.0, Spring Data JPA
- **Database**: MySQL 8
- **Frontend**: HTML5, CSS3, Thymeleaf
- **Build Tool**: Maven
- **Java Version**: 17

## Prerequisites

Before running the application, ensure you have:

1. **Java 17** or higher installed
2. **Maven 3.6+** installed
3. **MySQL 8** installed and running
4. **Git** (for cloning the repository)

## Database Setup

1. **Install MySQL** (if not already installed):
   ```bash
   # On Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server
   
   # On CentOS/RHEL
   sudo yum install mysql-server
   
   # On macOS (using Homebrew)
   brew install mysql
   ```

2. **Start MySQL service**:
   ```bash
   # On Linux
   sudo systemctl start mysql
   sudo systemctl enable mysql
   
   # On macOS
   brew services start mysql
   ```

3. **Create database and user**:
   ```sql
   mysql -u root -p
   
   CREATE DATABASE document_manager;
   CREATE USER 'docuser'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON document_manager.* TO 'docuser'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

## Installation & Setup

1. **Clone the repository** (or download the source code):
   ```bash
   git clone <repository-url>
   cd document-upload-app
   ```

2. **Configure database connection** (if needed):
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/document_manager?createDatabaseIfNotExist=true
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   ```

3. **Build the application**:
   ```bash
   mvn clean compile
   ```

4. **Run the application**:
   ```bash
   mvn spring-boot:run
   ```

   Or alternatively:
   ```bash
   mvn clean package
   java -jar target/document-upload-app-0.0.1-SNAPSHOT.jar
   ```

## Accessing the Application

Once the application is running, open your web browser and navigate to:

**http://localhost:8080**

## Application Usage

### Uploading Documents
1. Click on "Choose file to upload" button
2. Select a file from your computer
3. Click "Upload Document" button
4. The file will be uploaded and appear in the documents list

### Viewing Documents
- Click the "👁️ View" button next to any document
- The document will open in a new browser tab

### Downloading Documents
- Click the "⬇️ Download" button next to any document
- The file will be downloaded to your default downloads folder

### Deleting Documents
- Click the "🗑️ Delete" button next to any document
- Confirm the deletion in the popup dialog
- The document will be permanently removed

### Navigation
- Use the pagination controls at the bottom to navigate between pages
- Each page shows a maximum of 5 documents
- Page numbers and Previous/Next buttons are available

## File Storage

- Uploaded files are stored in the `./uploads/` directory relative to the application
- File metadata is stored in the MySQL database
- Original filenames are preserved while actual files are stored with unique names

## Configuration

Key configuration properties in `application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/document_manager
spring.datasource.username=root
spring.datasource.password=password

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Application Configuration
server.port=8080
app.upload.dir=./uploads/
```

## Troubleshooting

### Common Issues

1. **MySQL Connection Error**:
   - Ensure MySQL is running: `sudo systemctl status mysql`
   - Check database credentials in `application.properties`
   - Verify database exists: `SHOW DATABASES;` in MySQL

2. **Port Already in Use**:
   - Change the port in `application.properties`: `server.port=8081`
   - Or kill the process using port 8080: `sudo lsof -t -i:8080 | xargs kill -9`

3. **File Upload Issues**:
   - Check file size (max 10MB allowed)
   - Ensure upload directory is writable
   - Check disk space availability

4. **Permission Denied Errors**:
   - Ensure the application has write permissions to the uploads directory
   - Run with appropriate user privileges

### Logs

Application logs are displayed in the console. For more detailed logging, you can modify the logging level in `application.properties`:

```properties
logging.level.com.documentmanager=DEBUG
logging.level.org.springframework.web.multipart=DEBUG
```

## API Endpoints

The application provides the following endpoints:

- `GET /` - Main page with document listing and upload form
- `POST /upload` - Upload a new document
- `GET /view/{id}` - View a document inline
- `GET /download/{id}` - Download a document
- `POST /delete/{id}` - Delete a document
- `GET /?page={pageNumber}` - Navigate to a specific page

## Development

To run in development mode with auto-reload:

```bash
mvn spring-boot:run -Dspring.profiles.active=dev
```

## Production Deployment

For production deployment:

1. **Package the application**:
   ```bash
   mvn clean package -DskipTests
   ```

2. **Run with production profile**:
   ```bash
   java -jar target/document-upload-app-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
   ```

3. **Use external configuration**:
   ```bash
   java -jar app.jar --spring.config.location=/path/to/application-prod.properties
   ```

## Security Considerations

- The current implementation is for demonstration purposes
- In production, consider adding:
  - User authentication and authorization
  - File type validation
  - Virus scanning
  - Rate limiting
  - HTTPS/SSL configuration
  - Input sanitization

## License

This project is created for educational and demonstration purposes.