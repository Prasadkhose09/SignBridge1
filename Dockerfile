# Stage 1: Build the Maven application
FROM maven:3.9.6-eclipse-temurin-17-focal AS build
WORKDIR /app

# Copy the build configuration files
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
# Copy the source code
COPY src ./src

# Build the application skipping tests to speed up deployment
RUN mvn clean package -DskipTests

# Stage 2: Create the production image
FROM eclipse-temurin:17-jre-focal
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port your Spring Boot app runs on
EXPOSE 8080

# Command to run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
