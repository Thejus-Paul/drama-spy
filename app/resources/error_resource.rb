# Used to serialize default error object into a JSON response.
class ErrorResource
  include Alba::Resource

  attribute(:status) { :error }

  attributes(:message)
end
