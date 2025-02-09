class AddPosterUrlToDramas < ActiveRecord::Migration[8.1]
  def change
    add_column :dramas, :poster_url, :string, limit: 500
  end
end
