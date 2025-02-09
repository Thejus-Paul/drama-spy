class CreateDramas < ActiveRecord::Migration[8.1]
  def change
    create_table :dramas do |t|
      t.string :name, null: false
      t.integer :last_watched_episode, default: 0, null: false
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
