#!/usr/bin/env ruby

require 'json'

def revert_acronyms item 
    item.gsub('DB', 'Dumbbell').gsub('w/', 'with').gsub('Ab', 'Abdominais').gsub('Cbl', 'Cable').gsub('BB', 'Barbell')
end

def translate language
    json = JSON.parse(File.read("src/assets/i18n/#{language}.json"))

    json.filter { |_, v| v.nil? }.map { |k, _| revert_acronyms(k) }.each do |k|
        json[k] = `trans -brief :#{language} "#{k}"`.strip
    end

    opts = {
        array_nl: "\n",
        object_nl: "\n",
        indent: '  ',
        space_before: ' ',
        space: ' '
    }
    puts JSON.generate(json, opts)
end

translate ARGV[0]