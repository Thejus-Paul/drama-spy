# Used to serialize default error object into a JSON response.
class ErrorResource < ApplicationResource
  attribute(:status) { :error }

  attributes(:message)
end
