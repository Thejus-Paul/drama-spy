class ChangeDramaDescriptionLimit < ActiveRecord::Migration[8.1]
  def change
    change_column :dramas, :description, :text, limit: 2000
  end
end
