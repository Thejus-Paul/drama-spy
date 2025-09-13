class ChangeDramaDescriptionLimit < ActiveRecord::Migration[8.1]
  def up
    change_column :dramas, :description, :text, limit: 2000
  end

  def down
    change_column :dramas, :description, :text, limit: 1000
  end
end
