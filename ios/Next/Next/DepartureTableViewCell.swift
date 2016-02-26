//
//  DepartureTableViewCell.swift
//  Next
//
//  Created by Hannes Waller on 2015-03-14.
//  Copyright (c) 2015 Hannes Waller. All rights reserved.
//

import UIKit

class DepartureTableViewCell: UITableViewCell {
    
    @IBOutlet weak var lineNumberLabel: UILabel!
    @IBOutlet weak var lineDestinationLabel: UILabel!
    @IBOutlet weak var timeLabel: UILabel!
    @IBOutlet weak var typeImgView: UIImageView!
    
    override func awakeFromNib() {
        super.awakeFromNib()
    }

    override func setSelected(selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)
    }

    func loadItem(#d: Departure) {

        lineNumberLabel.text = d.lineNumber
        
        if d.type == .Buss {
            typeImgView.image = UIImage(named: "buss")
        } else {
            typeImgView.image = UIImage(named: "trikk")
        }
        
        lineDestinationLabel.text = d.lineDestination
        timeLabel.text = d.timeToDeparture
    }
}
