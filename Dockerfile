# Sử dụng một image Node.js chính thức
FROM node:latest

# Tạo thư mục làm việc cho ứng dụng
WORKDIR /app

# Sao chép file package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt các phụ thuộc
RUN yarn

# Sao chép toàn bộ mã nguồn vào thư mục làm việc
COPY . .

# Build ứng dụng (nếu bạn đang dùng TypeScript)
RUN npm run build

# Mở cổng ứng dụng (thường là 3000 cho NestJS)
EXPOSE 3000

# Khởi chạy ứng dụng
CMD ["yarn", "start:prod"]
