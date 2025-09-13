# Generates secure and normalized cache keys for application caching
class CacheKeyService
  def self.get_key(name, type)
    sanitized_name = name.to_s.strip
      .gsub(/[^\w\-.]/, "_").squeeze("_")        # Collapse multiple underscores
      .gsub(/^_|_$/, "")      # Remove leading/trailing underscores
      .downcase
    "#{type}/#{sanitized_name}"
  end
end
