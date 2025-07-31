class AllowNullMetadataInDramas < ActiveRecord::Migration[8.1]
  def change
    change_column_null :dramas, :metadata, true
    change_column_default :dramas, :metadata, from: {}, to: nil
  end
end
