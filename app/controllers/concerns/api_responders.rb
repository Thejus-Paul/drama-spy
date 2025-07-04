# Used to render success and error responses in a consistent manner.
module ApiResponders
  def render_success(message, status: :ok) = render(status:, json: SuccessResource.new({ message: }).serialize)

  def render_error(message, status: :unprocessable_entity) = render(status:, json: ErrorResource.new({ message: }).serialize)
end
