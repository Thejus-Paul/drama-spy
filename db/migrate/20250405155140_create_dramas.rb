
# Creates dramas table to store watched dramas
class CreateDramas < ActiveRecord::Migration[8.1]
  def change
    create_table :dramas do |t|
      t.integer :airing_status, null: false, default: 0
      t.string :country, null: false
      t.text :description
      t.integer :last_watched_episode, null: false, default: 0
      t.string :name, null: false, index: { unique: true }
      t.integer :total_episodes, null: false, default: 1
      t.integer :watch_status, null: false, default: 0, index: true

      t.timestamps
    end

    add_check_constraint :dramas, "last_watched_episode <= total_episodes", name: "last_watched_episode_valid"
  end
end
