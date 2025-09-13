# Generates secure and normalized cache keys for application caching
class CacheKeyService
  def self.get_key(name, type)
    sanitized_name = name.to_s.strip
      .gsub(/[^\w\-.]/, "_").squeeze("_")        # Collapse multiple underscores
      .gsub(/^_|_$/, "")      # Remove leading/trailing underscores
      .downcase
    sanitized_type = type.to_s.strip
      .gsub(/[^\w\-.]/, "_").squeeze("_")
      .gsub(/^_|_$/, "")
      .downcase
    sanitized_name = "unknown" if sanitized_name.empty?
    "#{sanitized_type}/#{sanitized_name}"
  end
end
