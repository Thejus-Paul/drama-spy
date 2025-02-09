# Used to serialize default object into a JSON response.
class ApplicationResource
  include Alba::Resource
  helper Typelizer::DSL

  typelize status: { enum: [ :success, :error ] }
  typelize message: :string
end
