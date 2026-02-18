FROM node:20 as build
WORKDIR /app

ARG REACT_APP_API_BASE
ENV REACT_APP_API_BASE=$REACT_APP_API_BASE

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

COPY frontend/. ./

RUN echo "BUILD TIME REACT_APP_API_BASE: $REACT_APP_API_BASE"
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
