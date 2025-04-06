# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2025_04_05_155140) do
  create_table "dramas", force: :cascade do |t|
    t.integer "airing_status", default: 0, null: false
    t.string "country", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.integer "last_watched_episode", default: 0, null: false
    t.string "name", null: false
    t.integer "total_episodes", default: 1, null: false
    t.datetime "updated_at", null: false
    t.integer "watch_status", default: 0, null: false
    t.index ["name"], name: "index_dramas_on_name", unique: true
    t.index ["watch_status"], name: "index_dramas_on_watch_status"
    t.check_constraint "last_watched_episode <= total_episodes", name: "last_watched_episode_valid"
  end
end
