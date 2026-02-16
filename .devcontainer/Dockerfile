FROM debian:bullseye

RUN apt-get update && apt-get install -y \
    curl wget unzip git procps \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Zulu JDK 7 (project build)
RUN mkdir -p /opt/java7 \
    && wget -q https://cdn.azul.com/zulu/bin/zulu7.56.0.11-ca-jdk7.0.352-linux_x64.tar.gz -O /tmp/jdk7.tar.gz \
    && tar xzf /tmp/jdk7.tar.gz -C /opt/java7 --strip-components=1 \
    && rm /tmp/jdk7.tar.gz

# Zulu JDK 17 (VS Code Java Language Server)
RUN mkdir -p /opt/java17 \
    && wget -q https://cdn.azul.com/zulu/bin/zulu17.54.21-ca-jdk17.0.13-linux_x64.tar.gz -O /tmp/jdk17.tar.gz \
    && tar xzf /tmp/jdk17.tar.gz -C /opt/java17 --strip-components=1 \
    && rm /tmp/jdk17.tar.gz

# Default JAVA_HOME = JDK 7 (for Maven build)
ENV JAVA_HOME=/opt/java7
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Maven 3.6.3
RUN wget -q https://archive.apache.org/dist/maven/maven-3/3.6.3/binaries/apache-maven-3.6.3-bin.tar.gz -O /tmp/maven.tar.gz \
    && tar xzf /tmp/maven.tar.gz -C /opt \
    && rm /tmp/maven.tar.gz

ENV MAVEN_HOME=/opt/apache-maven-3.6.3
ENV PATH="${MAVEN_HOME}/bin:${PATH}"

# GlassFish 3.1.2.2
RUN wget -q https://download.oracle.com/glassfish/3.1.2.2/release/glassfish-3.1.2.2.zip -O /tmp/glassfish.zip \
    && unzip -q /tmp/glassfish.zip -d /opt \
    && rm /tmp/glassfish.zip

ENV GLASSFISH_HOME=/opt/glassfish3

WORKDIR /workspace
