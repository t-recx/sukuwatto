#!/usr/bin/env ruby

require 'json'

def update_fixture language
    fixture_json = JSON.parse(File.read('../backend/workouts/fixtures/exercises.json'))
    translation_json = JSON.parse(File.read("src/assets/i18n/#{language}.json"))

    fixture_json.each do |record| 
        record["fields"]["name_pt"] = translation_json[record["fields"]["name"]]
    end

    opts = {
        array_nl: "\n",
        object_nl: "\n",
        indent: '  ',
        space_before: ' ',
        space: ' '
    }
    puts JSON.generate(fixture_json, opts)
end

update_fixture ARGV[0]