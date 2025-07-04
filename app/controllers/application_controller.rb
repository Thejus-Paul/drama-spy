# Controller that's inherited by other user defined controllers
class ApplicationController < ActionController::API
  include ApiResponders
end
