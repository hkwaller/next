//
//  Departure.swift
//  Next
//
//  Created by Hannes Waller on 2015-03-14.
//  Copyright (c) 2015 Hannes Waller. All rights reserved.
//

enum Type {
    case Trikk
    case Buss
}

import Foundation

class Departure {
    var lineNumber: String
    var lineDestination: String
    var timeToDeparture: String
    var type: Type
    
    init(lineNumber: String, lineDestination: String, timeToDeparture: String, imageType: String) {
        self.lineNumber = lineNumber
        self.lineDestination = lineDestination
        self.timeToDeparture = timeToDeparture
        
        if imageType == "buss" {
            self.type = .Buss
        } else {
            self.type = .Trikk
        }
    }
}