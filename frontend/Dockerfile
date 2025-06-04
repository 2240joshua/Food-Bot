FROM node:20 as build

WORKDIR /app

# Copy ONLY frontend's package.json & lock
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# Copy the rest of the frontend app
COPY frontend/. ./
RUN echo "BUILD TIME REACT_APP_API_URL: $REACT_APP_API_URL"

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
