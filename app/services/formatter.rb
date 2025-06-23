# The Formatter module provides utility methods for formatting model-related output.
module Formatter
  def self.error(model) = model.errors.full_messages.to_sentence.capitalize
end
