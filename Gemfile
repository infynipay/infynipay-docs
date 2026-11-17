# Pinned to match infynipay-product-www, so both sites build on the same Jekyll and a
# convention that works in one cannot silently break in the other.
source "https://rubygems.org"

gem "jekyll", "~> 4.4"

group :jekyll_plugins do
  gem "jekyll-sitemap"
  gem "jekyll-seo-tag"
end

# Windows and JRuby do not include zoneinfo files.
#
# `:windows` rather than the older `:mingw, :x64_mingw, :mswin` trio: Bundler 4
# deprecates those and warns on every invocation, including each CI run.
platforms :windows, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# File-watching for `jekyll serve` on Windows only; never installed on the
# Linux runner, which is why it must stay platform-gated.
gem "wdm", "~> 0.1", :platforms => [:windows]
