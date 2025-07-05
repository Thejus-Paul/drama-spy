# Used to serialize default success object into a JSON response.
class SuccessResource < ApplicationResource
  attribute(:status) { :success }

  attributes(:message)
end
