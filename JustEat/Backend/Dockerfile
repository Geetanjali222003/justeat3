# ========== Stage 1: Build ==========
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app

# Copy pom.xml first to cache dependency layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build (skip tests — tests run in CI separately)
COPY src ./src
RUN mvn package -DskipTests -B

# ========== Stage 2: Runtime ==========
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S justeat && adduser -S justeat -G justeat

COPY --from=build /app/target/*.jar app.jar

RUN chown justeat:justeat app.jar
USER justeat

EXPOSE 8090

ENTRYPOINT ["java", "-jar", "app.jar"]

