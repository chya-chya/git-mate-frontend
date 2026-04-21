FROM node:20-alpine

WORKDIR /app

# 의존성 설치를 위해 package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# Next.js 기본 포트 노출
EXPOSE 3000

# 환경 변수 설정
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV WATCHPACK_POLLING=true

# 개발 모드 실행
CMD ["npm", "run", "dev"]
