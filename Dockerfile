FROM node:14-slim
COPY package*.json /
COPY dist/ /dist/
COPY node_modules/ /node_modules/
EXPOSE 3001
CMD ["node", "."]