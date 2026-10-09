FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /workspace
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre-jammy

WORKDIR /app
COPY --from=build --chown=10001:10001 /workspace/target/appointment-2.0.0.jar ./app.jar
USER 10001:10001
EXPOSE 4000
CMD ["sh", "-c", "exec java -Dserver.port=${PORT:-4000} -jar /app/app.jar"]
