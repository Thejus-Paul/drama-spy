# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
require "faker"

user ||= User.create!(email_address: "test@example.com", password: "welcome", password_confirmation: "welcome")
dramas = []

100.times do
  dramas.push({ name: Faker::Movie.unique.title, last_watched_episode: Faker::Number.rand_in_range(1, 12), user: })
end

Drama.find_or_create_by!(dramas)
