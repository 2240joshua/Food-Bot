FROM node:20 as build
WORKDIR /app

# Build-time arg + export into env for CRA build
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

COPY frontend/. ./

RUN echo "BUILD TIME REACT_APP_API_URL: $REACT_APP_API_URL"
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
