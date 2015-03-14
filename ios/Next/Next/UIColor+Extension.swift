//
//  UIColor+Extension.swift
//  Next
//
//  Created by Hannes Waller on 2015-03-14.
//  Copyright (c) 2015 Hannes Waller. All rights reserved.
//

import UIKit

extension UIColor {
    convenience init(r: CGFloat, g: CGFloat, b: CGFloat) {
        self.init(red: r/255, green: g/255, blue: b/255, alpha: 1)
    }
    
    class func titleBlack () -> UIColor {
        return UIColor(r: 0, g: 0, b: 0)
    }
    
    class func niceGrey () -> UIColor {
        return UIColor(r: 83, g: 83, b: 83)
    }

}