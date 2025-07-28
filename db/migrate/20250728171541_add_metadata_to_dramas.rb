class AddMetadataToDramas < ActiveRecord::Migration[8.1]
  def change
    add_column :dramas, :metadata, :json, default: {}, null: false
  end
end
