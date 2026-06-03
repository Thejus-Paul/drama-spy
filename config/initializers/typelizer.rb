if defined?(Typelizer)
  # Development: the real gem is loaded and writes TypeScript interfaces.
  Typelizer.configure do |config|
    config.output_dir = "./types"
  end
else
  # Production/test: Typelizer is a development-only dependency, so the gem is
  # absent. The Alba resources still reference its DSL at class-body level
  # (`helper Typelizer::DSL`, `typelize`, `typelize_from`), so provide a no-op
  # shim that mirrors how the gem wires itself in: Alba's `helper` does
  # `extend mod`, which fires `extended`, which extends the class macros onto
  # the resource. Class methods are inherited, so subclasses are covered too.
  module Typelizer
    module DSL
      module ClassMethods
        def typelize(*, **) = nil
        def typelize_from(*) = nil
        def typelize_meta(*, **) = nil
      end

      def self.included(base) = base.extend(ClassMethods)
      def self.extended(base) = base.extend(ClassMethods)
    end
  end
end
