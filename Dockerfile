# Dockerfile for StudentCourseApp
FROM node:18

WORKDIR /app

# copy package files first to leverage Docker cache
COPY package*.json ./

# install dependencies
RUN npm install --production

# copy rest of the app
COPY . .

# create non-root user (safer)
RUN useradd --user-group --create-home --shell /bin/false appuser
USER appuser

# expose port the app listens on
EXPOSE 5000

# start app
CMD ["node", "server.js"]
