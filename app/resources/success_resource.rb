# Used to serialize default success object into a JSON response.
class SuccessResource
  include Alba::Resource

  attribute(:status) { :success }

  attributes(:message)
end
